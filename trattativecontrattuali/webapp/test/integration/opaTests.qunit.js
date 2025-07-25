sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/company/trattativecontrattuali/trattativecontrattuali/test/integration/FirstJourney',
		'com/company/trattativecontrattuali/trattativecontrattuali/test/integration/pages/TTCTRequestSetObjectPage'
    ],
    function(JourneyRunner, opaJourney, TTCTRequestSetObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/company/trattativecontrattuali/trattativecontrattuali') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheTTCTRequestSetObjectPage: TTCTRequestSetObjectPage
                }
            },
            opaJourney.run
        );
    }
);