import Controller from "sap/ui/core/mvc/Controller";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import type UIComponent from "sap/ui/core/UIComponent";
import type Router from "sap/ui/core/routing/Router";

interface Section1Data {
    selectedTipologia: number;
    showValidationError: boolean;
    tipologiaOptions: {
        text: string;
        description: string;
        value: string;
    }[];
}

interface RadioButtonGroup {
    getSelectedIndex(): number;
}

interface SavedData {
    tipologiaRichiesta: string | null;
}

/**
 * @namespace com.company.trattativecontrattuali.trattativecontrattuali.controller
 */
export default class Section1 extends Controller {
    
    private sectionData: Section1Data = {
        selectedTipologia: -1, // -1 = nessuna selezione
        showValidationError: false,
        tipologiaOptions: [
            {
                text: "Nuova richiesta",
                description: "Da selezionare quando si crea una richiesta ex novo",
                value: "NUOVA"
            },
            {
                text: "Precisazione", 
                description: "Per fornire ulteriori dettagli su una richiesta già inserita",
                value: "PRECISAZIONE"
            },
            {
                text: "Variazione Dati",
                description: "Per modificare i dati di una richiesta già validata", 
                value: "VARIAZIONE"
            }
        ]
    };

    public onInit(): void {
        try {
            // Inizializza il modello dati
            const oModel = new JSONModel(this.sectionData);
            this.getView()?.setModel(oModel);
            
            // Carica dati esistenti se presenti
            this.loadExistingData().catch(() => {
                MessageToast.show("Errore nel caricamento dei dati iniziali");
            });
        } catch (error) {
            MessageToast.show("Errore nell'inizializzazione della sezione");
        }
    }
    
    public onTipologiaSelect(oEvent: Event): void {
        try {
            const oRadioButtonGroup = oEvent.getSource() as unknown as RadioButtonGroup;
            const iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
            
            // Aggiorna il modello
            this.sectionData.selectedTipologia = iSelectedIndex;
            this.sectionData.showValidationError = false;
            
            const oModel = this.getView()?.getModel() as JSONModel;
            if (oModel) {
                oModel.setProperty("/selectedTipologia", iSelectedIndex);
                oModel.setProperty("/showValidationError", false);
                oModel.refresh();
            }
            
            // Salva automaticamente la selezione
            this.saveSection().catch(() => {
                MessageToast.show("Errore nel salvataggio automatico");
            });
            
            // Mostra feedback
            const selectedOption = this.sectionData.tipologiaOptions[iSelectedIndex];
            if (selectedOption) {
                MessageToast.show(`Selezionato: ${selectedOption.text}`);
            }
        } catch (error) {
            MessageToast.show("Errore nella selezione della tipologia");
        }
    }

    public onPreviousSection(): void {
        // La sezione 1 è la prima, quindi naviga al dashboard
        this.navigateToSection("dashboard");
    }

    public async onNextSection(): Promise<void> {
        try {
            // Valida che sia stata fatta una selezione
            if (this.sectionData.selectedTipologia === -1) {
                this.sectionData.showValidationError = true;
                const oModel = this.getView()?.getModel() as JSONModel;
                if (oModel) {
                    oModel.setProperty("/showValidationError", true);
                    oModel.refresh();
                }
                
                MessageToast.show("Selezionare una tipologia di richiesta prima di continuare");
                return;
            }

            // Salva i dati della sezione
            await this.saveSection();
            
            // Naviga alla sezione 2
            this.navigateToSection("2");
        } catch (error) {
            MessageToast.show("Errore nel passaggio alla sezione successiva");
        }
    }

    public async onSaveDraft(): Promise<void> {
        try {
            await this.saveSection();
            MessageToast.show("Sezione 1 salvata in bozza");
        } catch (error) {
            MessageToast.show("Errore nel salvataggio della bozza");
        }
    }

    public async onSubmitToTC(): Promise<void> {
        try {
            await this.saveSection();
            MessageToast.show("Funzione di invio non ancora disponibile dalla sezione");
        } catch (error) {
            MessageToast.show("Errore nel salvataggio");
        }
    }

    public onNavBack(): void {
        // Naviga al dashboard
        this.navigateToSection("dashboard");
    }

    public onBeforeRendering(): void {
        try {
            this.loadExistingData().catch(() => {
                // Silent fail
            });
        } catch (error) {
            // Silent fail
        }
    }

    public onAfterRendering(): void {
        try {
            this.updateUIState();
        } catch (error) {
            // Silent fail
        }
    }

    public onExit(): void {
        // Cleanup quando il controller viene distrutto
    }

    private updateUIState(): void {
        try {
            const oView = this.getView();
            if (!oView) { return; }

            const oModel = oView.getModel() as JSONModel;
            if (!oModel) { return; }

            // Aggiorna stato UI in base ai dati
            if (this.sectionData.selectedTipologia === -1) {
                this.sectionData.showValidationError = false;
            }
            oModel.refresh();
        } catch (error) {
            // Silent fail
        }
    }

    private async saveSection(): Promise<void> {
        try {
            if (this.sectionData.selectedTipologia === -1) {
                return; // Non salvare se non c'è selezione
            }

            // Simula salvataggio nel backend
            await this.saveSectionData();
            
            // Notifica completamento sezione
            this.updateGlobalProgress();
        } catch (error) {
            throw new Error("Errore durante il salvataggio");
        }
    }

    private async loadExistingData(): Promise<void> {
        try {
            const savedData = await this.getSavedSectionData();
            if (savedData && savedData.tipologiaRichiesta) {
                const index = this.sectionData.tipologiaOptions.findIndex(
                    option => option.value === savedData.tipologiaRichiesta
                );
                
                if (index !== -1) {
                    this.sectionData.selectedTipologia = index;
                    this.updateUIState();
                }
            }
        } catch (error) {
            throw new Error("Errore nel caricamento dei dati");
        }
    }

    private saveSectionData(): Promise<void> {
        return new Promise((resolve) => {
            // Simula chiamata al backend per salvare i dati della sezione
            // In produzione, userebbe il modello OData per salvare
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    private updateGlobalProgress(): void {
        try {
            // Notifica al dashboard che la sezione 1 è stata completata
            sap.ui.getCore().getEventBus().publish("ttct", "sectionCompleted", {
                sectionId: "1",
                completed: true
            });
        } catch (error) {
            // Silent fail
        }
    }

    private navigateToSection(section: string): void {
        try {
            const oComponent = this.getOwnerComponent() as UIComponent & { getRouter?: () => Router };
            const oRouter = oComponent.getRouter && typeof oComponent.getRouter === "function"
                ? oComponent.getRouter()
                : null;
            if (!oRouter) {
                MessageToast.show("Router non disponibile");
                return;
            }
            
            if (section === "dashboard") {
                oRouter.navTo("dashboard");
            } else {
                // Costruisce il nome della route dinamicamente
                const routeName = `section${section}`;
                oRouter.navTo(routeName);
            }
        } catch (error) {
            MessageToast.show(`Errore nella navigazione alla sezione ${section}`);
            // Fallback al dashboard
            try {
                const oComponent = this.getOwnerComponent() as UIComponent & { getRouter?: () => Router };
                const oRouter = oComponent.getRouter && typeof oComponent.getRouter === "function"
                    ? oComponent.getRouter()
                    : null;
                if (oRouter) {
                    oRouter.navTo("dashboard");
                }
            } catch (fallbackError) {
                MessageToast.show("Errore critico nella navigazione");
            }
        }
    }

    private async getSavedSectionData(): Promise<SavedData> {
        // Simula recupero dati dal backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    tipologiaRichiesta: null // o un valore salvato precedentemente
                });
            }, 100);
        });
    }
}