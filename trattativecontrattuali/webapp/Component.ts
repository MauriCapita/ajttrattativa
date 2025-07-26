import UIComponent from "sap/ui/core/UIComponent";
import Device from "sap/ui/Device";
import models from "./model/models";
import jQuery from "jquery";

/**
 * @namespace com.company.trattativecontrattuali.trattativecontrattuali
 */
export default class Component extends UIComponent {

	public static metadata = {
		manifest: "json"
	};

	private contentDensityClass: string;

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
	 * @public
	 * @override
	 */
	public init(): void {
		// call the base component's init function
		super.init();

		// set the device model
		this.setModel(models.createDeviceModel(), "device");

		// create the views based on the url/hash
		this.getRouter().initialize();
	}

	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 *
	 * @public
	 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
	 */
	public getContentDensityClass(): string {
		if (this.contentDensityClass === undefined) {
			// check whether FLP has already set the content density class
			if (jQuery("body").hasClass("sapUiSizeCozy") || jQuery("body").hasClass("sapUiSizeCompact")) {
				this.contentDensityClass = "";
			} else if (!Device.support.touch) {
				// apply "compact" mode if touch is not supported
				this.contentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls
				this.contentDensityClass = "sapUiSizeCozy";
			}
		}
		return this.contentDensityClass;
	}
}