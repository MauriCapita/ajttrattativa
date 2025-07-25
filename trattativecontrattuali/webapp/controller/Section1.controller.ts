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
        this.loadExistingData();
    }

    public onTipologiaSelect(oEvent: Event): void {
        // Cast esplicito al tipo RadioButtonGroup
        const oRadioButtonGroup = oEvent.getSource() as unknown as RadioButtonGroup;
        const iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
        // Aggiorna il modello
        this.sectionData.selectedTipologia = iSelectedIndex;
        this.sectionData.showValidationError = false;
        const oModel = this.getView()?.getModel() as JSONModel;
        oModel.refresh();
        // Salva automaticamente la selezione
        this.autoSave();
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

    public onNextSection(): void {
        // Valida che sia stata fatta una selezione
        if (this.sectionData.selectedTipologia === -1) {
            this.sectionData.showValidationError = true;
            const oModel = this.getView()?.getModel() as JSONModel;
            oModel.refresh();
            
            MessageToast.show("Selezionare una tipologia di richiesta prima di continuare");
            return;
        }

        // Salva i dati della sezione
        this.saveSection();
        
        // Naviga alla sezione 2
        this.navigateToSection("2");
    }

    public onSaveDraft(): void {
        this.saveSection();
        MessageToast.show("Sezione 1 salvata in bozza");
    }

    public onSubmitToTC(): void {
        // Per ora, salva e mostra messaggio
        this.saveSection();
        MessageToast.show("Funzione di invio non ancora disponibile dalla sezione");
    }

    public onNavBack(): void {
        // Naviga al dashboard
        this.navigateToSection("dashboard");
    }

    private loadExistingData(): void {
        // Simula caricamento dati esistenti dal backend
        const savedData = this.getSavedSectionData();
        
        if (savedData && savedData.tipologiaRichiesta) {
            // Trova l'indice corrispondente al valore salvato
            const index = this.sectionData.tipologiaOptions.findIndex(
                option => option.value === savedData.tipologiaRichiesta
            );
            
            if (index !== -1) {
                this.sectionData.selectedTipologia = index;
                const oModel = this.getView()?.getModel() as JSONModel;
                oModel.refresh();
            }
        }
    }

    private getSavedSectionData(): { tipologiaRichiesta: string | null } {
        // Simula recupero dati dal backend
        // In produzione, farà una chiamata OData per recuperare i dati della sezione 1
        return {
            tipologiaRichiesta: null // o un valore salvato precedentemente
        };
    }

    private autoSave(): void {
        // Auto-salvataggio ogni volta che l'utente fa una selezione
        // In produzione, implementare debounce migliore se necessario
        this.saveSection();
    }

    private saveSection(): void {
        if (this.sectionData.selectedTipologia === -1) {
            return; // Non salvare se non c'è selezione
        }
        // Simula salvataggio nel backend
        // In produzione, farà una chiamata OData POST/PUT
        this.saveSectionData();
    }

    private saveSectionData(): void {
        // Simula chiamata al backend per salvare i dati della sezione
        // In produzione, userebbe il modello OData per salvare
        // Aggiorna anche il progresso globale
        this.updateGlobalProgress();
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
}