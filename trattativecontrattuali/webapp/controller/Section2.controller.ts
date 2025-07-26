import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";

interface Section2Data {
    codiceProgramma: string;
    nomeProgramma: string;
    versioneProgramma: string;
    showValidationError: boolean;
}

/**
 * @namespace com.company.trattativecontrattuali.trattativecontrattuali.controller
 */
export default class Section2 extends Controller {
    
    private sectionData: Section2Data = {
        codiceProgramma: "",
        nomeProgramma: "",
        versioneProgramma: "",
        showValidationError: false
    };

    public onInit(): void {
        try {
            const oModel = new JSONModel(this.sectionData);
            const oView = this.getView();
            if (oView) {
                oView.setModel(oModel);
            }
            
            this.loadExistingData();
        } catch (error) {
            MessageToast.show("Errore nell'inizializzazione della sezione");
        }
    }

    public onFieldChange(): void {
        try {
            // Reset validation error when user starts typing
            this.sectionData.showValidationError = false;
            const oView = this.getView();
            if (oView) {
                const oModel = oView.getModel() as JSONModel;
                if (oModel) {
                    oModel.setProperty("/showValidationError", false);
                }
            }
            
            // Auto-save on field change
            this.saveSection();
        } catch (error) {
            MessageToast.show("Errore nella gestione del campo");
        }
    }

    public onPreviousSection(): void {
        this.navigateToSection("1");
    }

    public onNextSection(): void {
        try {
            // Validate required fields
            if (!this.validateSection()) {
                this.sectionData.showValidationError = true;
                const oView = this.getView();
                if (oView) {
                    const oModel = oView.getModel() as JSONModel;
                    if (oModel) {
                        oModel.setProperty("/showValidationError", true);
                        oModel.refresh();
                    }
                }
                MessageToast.show("Completare tutti i campi obbligatori prima di continuare");
                return;
            }

            this.saveSection();
            this.navigateToSection("3");
        } catch (error) {
            MessageToast.show("Errore nel passaggio alla sezione successiva");
        }
    }

    public onSaveDraft(): void {
        try {
            this.saveSection();
            MessageToast.show("Sezione 2 salvata in bozza");
        } catch (error) {
            MessageToast.show("Errore nel salvataggio della bozza");
        }
    }

    public onSubmitToTC(): void {
        try {
            this.saveSection();
            MessageToast.show("Funzione di invio non ancora disponibile dalla sezione");
        } catch (error) {
            MessageToast.show("Errore nel salvataggio");
        }
    }

    public onNavBack(): void {
        this.navigateToSection("dashboard");
    }

    private validateSection(): boolean {
        try {
            const oView = this.getView();
            if (!oView) return false;
            
            const oModel = oView.getModel() as JSONModel;
            if (!oModel) return false;

            const data = oModel.getData() as Section2Data;
            
            // Check required fields
            return !!(data.codiceProgramma && data.nomeProgramma);
        } catch (error) {
            return false;
        }
    }

    private saveSection(): void {
        try {
            const oView = this.getView();
            if (!oView) return;
            
            const oModel = oView.getModel() as JSONModel;
            if (!oModel) return;

            const data = oModel.getData() as Section2Data;
            
            // Update internal data
            this.sectionData = { 
                codiceProgramma: data.codiceProgramma || "",
                nomeProgramma: data.nomeProgramma || "",
                versioneProgramma: data.versioneProgramma || "",
                showValidationError: data.showValidationError || false
            };
            
            // Update global progress if section is valid
            if (this.validateSection()) {
                this.updateGlobalProgress();
            }
        } catch (error) {
            MessageToast.show("Errore durante il salvataggio");
        }
    }

    private loadExistingData(): void {
        try {
            // Simulate loading saved data
            const savedData = {
                codiceProgramma: "",
                nomeProgramma: "",
                versioneProgramma: ""
            };
            
            if (savedData) {
                this.sectionData.codiceProgramma = savedData.codiceProgramma || "";
                this.sectionData.nomeProgramma = savedData.nomeProgramma || "";
                this.sectionData.versioneProgramma = savedData.versioneProgramma || "";
                
                const oView = this.getView();
                if (oView) {
                    const oModel = oView.getModel() as JSONModel;
                    if (oModel) {
                        oModel.setData(this.sectionData);
                    }
                }
            }
        } catch (error) {
            // Silent fail
        }
    }

    private updateGlobalProgress(): void {
        try {
            const eventBus = sap.ui.getCore().getEventBus();
            if (eventBus && typeof eventBus.publish === "function") {
                eventBus.publish("ttct", "sectionCompleted", {
                    sectionId: "2",
                    completed: true
                });
            }
        } catch (error) {
            // Silent fail
        }
    }

    private navigateToSection(section: string): void {
        try {
            const oComponent = this.getOwnerComponent();
            if (!oComponent) {
                MessageToast.show("Componente non disponibile");
                return;
            }
            
            const getRouter = (oComponent as any).getRouter;
            if (typeof getRouter !== "function") {
                MessageToast.show("Router non disponibile");
                return;
            }
            
            const oRouter = getRouter.call(oComponent);
            if (!oRouter || typeof oRouter.navTo !== "function") {
                MessageToast.show("Router non funzionante");
                return;
            }
            
            if (section === "dashboard") {
                oRouter.navTo("dashboard");
            } else {
                const routeName = "section" + section;
                oRouter.navTo(routeName);
            }
        } catch (error) {
            MessageToast.show("Errore nella navigazione alla sezione " + section);
        }
    }
}