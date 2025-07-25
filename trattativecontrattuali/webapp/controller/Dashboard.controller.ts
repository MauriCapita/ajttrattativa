import Controller from "sap/ui/core/mvc/Controller";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import type CustomData from "sap/ui/core/CustomData";
import type UIComponent from "sap/ui/core/UIComponent";
import type Router from "sap/ui/core/routing/Router";

interface SectionStatus {
    completed: boolean;
    required: boolean;
    isEmpty: boolean;
}

interface AppData {
    progressText: string;
    completedSections: number;
    totalSections: number;
    sections: { [key: string]: SectionStatus };
}

/**
 * @namespace com.company.trattativecontrattuali.trattativecontrattuali.controller
 */
export default class Dashboard extends Controller {
    
    private appData: AppData = {
        progressText: "0 di 14 sezioni completate",
        completedSections: 0,
        totalSections: 14,
        sections: {
            "1": { completed: true, required: true, isEmpty: false },
            "2": { completed: false, required: true, isEmpty: true },
            "3": { completed: false, required: true, isEmpty: true },
            "4": { completed: false, required: true, isEmpty: true },
            "5": { completed: false, required: true, isEmpty: true },
            "6": { completed: false, required: true, isEmpty: true },
            "7": { completed: false, required: false, isEmpty: true },
            "8": { completed: false, required: true, isEmpty: true },
            "9": { completed: false, required: true, isEmpty: true },
            "10": { completed: false, required: false, isEmpty: true },
            "11": { completed: false, required: false, isEmpty: true },
            "12": { completed: false, required: true, isEmpty: true },
            "13": { completed: false, required: false, isEmpty: true },
            "14": { completed: false, required: false, isEmpty: true }
        }
    };

    public onInit(): void {
        // Inizializza il modello dati
        const oModel = new JSONModel(this.appData);
        const oView = this.getView();
        if (oView) {
            oView.setModel(oModel);
        }
        
        // Carica dati salvati (se esistenti)
        this.loadSavedProgress();
    }

    public onSectionPress(oEvent: Event): void {
        const oSource = oEvent.getSource() as unknown as { getCustomData: () => CustomData[] };
        const aCustomData: CustomData[] = oSource && typeof oSource.getCustomData === "function" ? oSource.getCustomData() : [];
        let sSection = "";
        if (Array.isArray(aCustomData) && aCustomData.length > 0) {
            for (let i = 0; i < aCustomData.length; i++) {
                const oCustomData = aCustomData[i];
                if (oCustomData && oCustomData.getKey() === "section") {
                    sSection = oCustomData.getValue() as string;
                    break;
                }
            }
        }
        if (sSection) {
            this.navigateToSection(sSection);
        }
    }

    public onSaveDraft(): void {
        // Salva bozza
        MessageToast.show("Bozza salvata con successo");
        
        // Simula salvataggio
        this.saveProgress();
    }

    public onSubmitToTC(): void {
        // Verifica che le sezioni obbligatorie siano completate
        const requiredSections = Object.keys(this.appData.sections).filter(key => 
            this.appData.sections[key].required
        );
        
        const completedRequired = requiredSections.filter(key => 
            this.appData.sections[key].completed
        );

        if (completedRequired.length < requiredSections.length) {
            MessageToast.show("Completare tutte le sezioni obbligatorie prima di inviare");
            return;
        }

        MessageToast.show("Richiesta inviata al Commercio Internazionale");
        
        // Simula invio
        this.submitRequest();
    }

    public onNavBack(): void {
        // Naviga indietro usando il router UI5
        const oComponent = this.getOwnerComponent() as UIComponent & { getRouter: () => Router };
        if (oComponent && typeof oComponent.getRouter === "function") {
            const oRouter = oComponent.getRouter();
            if (oRouter && typeof oRouter.navTo === "function") {
                oRouter.navTo("dashboard"); // Sostituisci con la route corretta se necessario
                return;
            }
        }
        MessageToast.show("Impossibile tornare indietro");
    }

    private navigateToSection(sSection: string): void {
        const oComponent = this.getOwnerComponent() as UIComponent & { getRouter: () => Router };
        if (!oComponent || typeof oComponent.getRouter !== "function") {
            MessageToast.show("Componente non disponibile");
            return;
        }
        const oRouter = oComponent.getRouter();
        if (!oRouter || typeof oRouter.navTo !== "function") {
            MessageToast.show("Router non disponibile");
            return;
        }
        try {
            switch (sSection) {
                case "1":
                    oRouter.navTo("section1");
                    break;
                case "2":
                    oRouter.navTo("section2");
                    break;
                case "3":
                    oRouter.navTo("section3");
                    break;
                case "4":
                    oRouter.navTo("section4");
                    break;
                case "5":
                    oRouter.navTo("section5");
                    break;
                case "6":
                    oRouter.navTo("section6");
                    break;
                case "7":
                    oRouter.navTo("section7");
                    break;
                case "8":
                    oRouter.navTo("section8");
                    break;
                case "9":
                    oRouter.navTo("section9");
                    break;
                case "10":
                    oRouter.navTo("section10");
                    break;
                case "11":
                    oRouter.navTo("section11");
                    break;
                case "12":
                    oRouter.navTo("section12");
                    break;
                case "13":
                    oRouter.navTo("section13");
                    break;
                case "14":
                    oRouter.navTo("section14");
                    break;
                default:
                    MessageToast.show("Sezione " + sSection + " non ancora implementata");
            }
        } catch (error) {
            MessageToast.show("Errore nella navigazione alla sezione " + sSection);
        }
    }

    private loadSavedProgress(): void {
        // Simula caricamento dati salvati
        // In produzione, questa funzione caricherà i dati dal backend
        try {
            const savedData = this.getSavedData();
            if (savedData && savedData.tipologiaRichiesta) {
                this.markSectionCompleted("1");
            }
        } catch {
            // Error loading saved progress - silent fail
        }
    }

    private getSavedData(): { tipologiaRichiesta?: string } | null {
        // Simula recupero dati salvati
        // In produzione, farà una chiamata OData
        return {
            tipologiaRichiesta: "Nuova richiesta"
        };
    }

    private markSectionCompleted(sSection: string): void {
        if (this.appData.sections[sSection]) {
            this.appData.sections[sSection].completed = true;
            this.appData.sections[sSection].isEmpty = false;
            
            // Aggiorna conteggio
            this.updateProgress();
        }
    }

    private updateProgress(): void {
        try {
            const completed = Object.values(this.appData.sections).filter(section => section.completed).length;
            this.appData.completedSections = completed;
            this.appData.progressText = completed + " di " + this.appData.totalSections + " sezioni completate";
            
            // Aggiorna il modello
            const oView = this.getView();
            if (oView) {
                const oModel = oView.getModel() as JSONModel;
                if (oModel) {
                    oModel.refresh();
                }
            }
        } catch (error) {
            // Error updating progress - silent fail
        }
    }

    private saveProgress(): void {
        try {
            // Simula salvataggio nel backend
            // Save progress data to backend here
            // Aggiorna il modello per riflettere eventuali modifiche
            const oView = this.getView();
            if (oView) {
                const oModel = oView.getModel() as JSONModel;
                if (oModel) {
                    oModel.refresh();
                }
            }
            // In produzione, farà una chiamata OData POST/PUT
        } catch {
            MessageToast.show("Errore nel salvataggio");
        }
    }

    private submitRequest(): void {
        try {
            // Simula invio della richiesta
            // Submit request to backend here
            // In produzione, cambierà lo status della richiesta e invierà notifiche
        } catch {
            MessageToast.show("Errore nell'invio della richiesta");
        }
    }
}