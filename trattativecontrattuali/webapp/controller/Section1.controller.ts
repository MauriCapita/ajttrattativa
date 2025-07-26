import Controller from "sap/ui/core/mvc/Controller";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";

interface Section1Data {
    selectedTipologia: number;
    showValidationError: boolean;
    tipologiaOptions: {
        text: string;
        description: string;
        value: string;
    }[];
}

// Tipizzazione minima per RadioButtonGroup SAPUI5
interface RadioButtonGroup {
    getSelectedIndex(): number;
}

// Tipizzazione minima per Router SAPUI5
interface Router {
    navTo(route: string): void;
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
        // Inizializza il modello dati
        const oModel = new JSONModel(this.sectionData);
        this.getView()?.setModel(oModel);
        
        // Carica dati esistenti se presenti
        void this.loadExistingData().catch(() => {
            MessageToast.show("Errore nel caricamento dei dati iniziali");
        });
    }
    
    public onTipologiaSelect(oEvent: Event): void {
        const oRadioButtonGroup = oEvent.getSource() as unknown as RadioButtonGroup;
        const iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
        
        // Aggiorna il modello
        this.sectionData.selectedTipologia = iSelectedIndex;
        this.sectionData.showValidationError = false;
        
        const oModel = this.getView()?.getModel() as JSONModel;
        oModel.refresh();
        
        // Salva automaticamente la selezione
        void this.saveSection().catch(() => {
            MessageToast.show("Errore nel salvataggio automatico");
        });
        
        // Mostra feedback
        const selectedOption = this.sectionData.tipologiaOptions[iSelectedIndex];
        if (selectedOption) {
            MessageToast.show(`Selezionato: ${selectedOption.text}`);
        }
    }

    public onPreviousSection(): void {
        // La sezione 1 è la prima, quindi disabilitata
        // Naviga al dashboard
        this.navigateToSection("dashboard");
    }

    public async onNextSection(): Promise<void> {
        // Valida che sia stata fatta una selezione
        if (this.sectionData.selectedTipologia === -1) {
            this.sectionData.showValidationError = true;
            const oModel = this.getView()?.getModel() as JSONModel;
            oModel.refresh();
            
            MessageToast.show("Selezionare una tipologia di richiesta prima di continuare");
            return;
        }

        // Salva i dati della sezione
        await this.saveSection().catch(() => {
            MessageToast.show("Errore nel salvataggio");
            return;
        });
        
        // Naviga alla sezione 2
        this.navigateToSection("2");
    }

    public async onSaveDraft(): Promise<void> {
        await this.saveSection().catch(() => {
            MessageToast.show("Errore nel salvataggio della bozza");
        });
        MessageToast.show("Sezione 1 salvata in bozza");
    }

    public async onSubmitToTC(): Promise<void> {
        // Per ora, salva e mostra messaggio
        await this.saveSection().catch(() => {
            MessageToast.show("Errore nel salvataggio");
            return;
        });
        MessageToast.show("Funzione di invio non ancora disponibile dalla sezione");
    }

    public onNavBack(): void {
        // Naviga al dashboard
        this.navigateToSection("dashboard");
    }

    public onBeforeRendering(): void {
        // Preparazione dati prima del rendering
        void this.loadExistingData().catch(() => {
            MessageToast.show("Errore nel caricamento dei dati");
        });
    }

    public onAfterRendering(): void {
        // Setup UI dopo il rendering
        this.updateUIState();
    }

    public onExit(): void {
        // Cleanup quando il controller viene distrutto
    }

    private updateUIState(): void {
        const oView = this.getView();
        if (!oView) { return; }

        const oModel = oView.getModel() as JSONModel;
        if (!oModel) { return; }

        // Aggiorna stato UI in base ai dati
        if (this.sectionData.selectedTipologia === -1) {
            this.sectionData.showValidationError = false;
        }
        oModel.refresh();
    }

    private async saveSection(): Promise<void> {
        if (this.sectionData.selectedTipologia === -1) {
            return; // Non salvare se non c'è selezione
        }

        try {
            // Simula salvataggio nel backend
            await this.saveSectionData();
            MessageToast.show("Sezione salvata con successo");
        } catch (error) {
            MessageToast.show("Errore durante il salvataggio");
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
            MessageToast.show("Errore nel caricamento dei dati");
        }
    }

    private saveSectionData(): Promise<void> {
        return new Promise((resolve) => {
            // Simula chiamata al backend per salvare i dati della sezione
            // In produzione, userebbe il modello OData per salvare
            this.updateGlobalProgress();
            resolve();
        });
    }

    private updateGlobalProgress(): void {
        // Notifica al dashboard che la sezione 1 è stata completata
        // Questo potrebbe essere fatto tramite un event bus o aggiornando un modello globale
        sap.ui.getCore().getEventBus().publish("ttct", "sectionCompleted", {
            sectionId: "1",
            completed: true
        });
    }

    private navigateToSection(section: string): void {
        const oComponent = this.getOwnerComponent() as { getRouter?: () => Router };
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
            // Naviga alla sezione specifica
            switch (section) {
                case "2":
                    oRouter.navTo("section2");
                    break;
                default:
                    MessageToast.show(`Sezione ${section} non ancora implementata`);
                    oRouter.navTo("dashboard");
            }
        }
    }

    private async getSavedSectionData(): Promise<SavedData> {
        // Simula recupero dati dal backend
        return new Promise((resolve) => {
            resolve({
                tipologiaRichiesta: null // o un valore salvato precedentemente
            });
        });
    }
}