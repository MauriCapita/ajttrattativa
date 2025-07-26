import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";

interface SectionStatus {
    completed: boolean;
    required: boolean;
    isEmpty: boolean;
}

interface DashboardData {
    progressText: string;
    completedSections: number;
    totalSections: number;
    sections: { [key: string]: SectionStatus };
}

interface EventBusPayload {
    sectionId: string;
    completed: boolean;
}

/**
 * @namespace com.company.trattativecontrattuali.trattativecontrattuali.controller
 */
export default class Dashboard extends Controller {
    private readonly onSectionCompletedBound: (channelId: string, eventId: string, data: object) => void;

    constructor(id: string = "Dashboard") {
        super(id);
        this.onSectionCompletedBound = (channelId: string, eventId: string, data: object): void => {
            const payload = data as EventBusPayload;
            if (payload && payload.sectionId && payload.completed) {
                this.markSectionCompleted(payload.sectionId);
            }
        };
    }

    private appData: DashboardData = {
        progressText: "1 di 14 sezioni completate",
        completedSections: 1,
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
        try {
            const oModel = new JSONModel(this.appData);
            const oView = this.getView();
            if (oView) {
                oView.setModel(oModel);
            }
            
            const eventBus = sap.ui.getCore().getEventBus();
            eventBus.subscribe("ttct", "sectionCompleted", this.onSectionCompletedBound);
            
            this.loadSavedProgress();
        } catch {
            MessageToast.show("Errore nell'inizializzazione del dashboard");
        }
    }

    public onExit(): void {
        try {
            const eventBus = sap.ui.getCore().getEventBus();
            eventBus.unsubscribe("ttct", "sectionCompleted", this.onSectionCompletedBound);
        } catch {
            // Silent fail
        }
    }

    public onSectionPress(oEvent: any): void {
        try {
            const oSource = oEvent.getSource();
            let sSection = "";
            
            // Usa any per evitare errori TypeScript con getCustomData
            if (oSource && oSource.getCustomData) {
                const aCustomData = oSource.getCustomData();
                if (Array.isArray(aCustomData) && aCustomData.length > 0) {
                    const oCustomData = aCustomData.find((data: any) => data.getKey() === "section");
                    if (oCustomData) {
                        sSection = oCustomData.getValue();
                    }
                }
            }
            
            if (sSection) {
                this.navigateToSection(sSection);
            } else {
                MessageToast.show("Errore nel recupero dei dati della sezione");
            }
        } catch {
            MessageToast.show("Errore nella gestione del click sulla sezione");
        }
    }

    public onSaveDraft(): void {
        try {
            MessageToast.show("Bozza salvata con successo");
            this.saveProgress();
        } catch {
            MessageToast.show("Errore nel salvataggio della bozza");
        }
    }

    public onSubmitToTC(): void {
        try {
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
            this.submitRequest();
        } catch {
            MessageToast.show("Errore nell'invio della richiesta");
        }
    }

    public onNavBack(): void {
        try {
            const oComponent = this.getOwnerComponent();
            if (oComponent && (oComponent as any).getRouter) {
                const oRouter = (oComponent as any).getRouter();
                if (oRouter && oRouter.navTo) {
                    window.history.back();
                    return;
                }
            }
            MessageToast.show("Impossibile tornare indietro");
        } catch {
            MessageToast.show("Errore nella navigazione");
        }
    }

    private navigateToSection(sSection: string): void {
        try {
            const oComponent = this.getOwnerComponent();
            if (!oComponent) {
                MessageToast.show("Componente non disponibile");
                return;
            }
            
            const oRouter = (oComponent as any).getRouter();
            if (!oRouter || !oRouter.navTo) {
                MessageToast.show("Router non disponibile");
                return;
            }
            
            const routeName = "section" + sSection;
            oRouter.navTo(routeName);
        } catch {
            MessageToast.show("Errore nella navigazione alla sezione " + sSection);
        }
    }

    private loadSavedProgress(): void {
        try {
            const savedData = this.getSavedData();
            if (savedData && savedData.tipologiaRichiesta) {
                this.markSectionCompleted("1");
            }
        } catch {
            // Silent fail
        }
    }

    private getSavedData(): { tipologiaRichiesta?: string } | null {
        try {
            return {
                tipologiaRichiesta: "Nuova richiesta"
            };
        } catch {
            return null;
        }
    }

    private markSectionCompleted(sSection: string): void {
        try {
            if (this.appData.sections[sSection]) {
                this.appData.sections[sSection].completed = true;
                this.appData.sections[sSection].isEmpty = false;
                this.updateProgress();
            }
        } catch {
            // Silent fail
        }
    }

    private updateProgress(): void {
        try {
            const completed = Object.values(this.appData.sections).filter(section => section.completed).length;
            this.appData.completedSections = completed;
            this.appData.progressText = completed + " di " + this.appData.totalSections + " sezioni completate";
            
            const oView = this.getView();
            if (oView) {
                const oModel = oView.getModel() as JSONModel;
                if (oModel) {
                    oModel.setProperty("/progressText", this.appData.progressText);
                    oModel.setProperty("/completedSections", this.appData.completedSections);
                    oModel.refresh();
                }
            }
        } catch {
            // Silent fail
        }
    }

    private saveProgress(): void {
        try {
            const oView = this.getView();
            if (oView) {
                const oModel = oView.getModel() as JSONModel;
                if (oModel) {
                    oModel.refresh();
                }
            }
        } catch {
            MessageToast.show("Errore nel salvataggio");
        }
    }

    private submitRequest(): void {
        try {
            // Simula invio della richiesta
        } catch {
            MessageToast.show("Errore nell'invio della richiesta");
        }
    }
}