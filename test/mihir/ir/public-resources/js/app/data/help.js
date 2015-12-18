/*global define:false*/
define(['underscore'], function(_) {
    "use strict";

    var HelpPages = [
        {
            identifier: 'c_Samples tab_ADM',
            name: 'Manage Samples',
	    page: 'manage-samples.html',
            helpPage: 'GUID-D5C26A1C-6C5D-46DA-B092-DD1E4450048F.html'
        }, 
	{
            identifier: 'c_Import Samples_ADM',
            name: 'Import Samples',
            page: 'import-sample.html',
            helpPage: 'GUID-950A7EED-3308-428E-8330-F0BFD1663451.html'
        },
	{
            identifier: 'c_Libraries_ADM',
            name: 'Libraries',
            page: 'library.html',
            helpPage: 'GUID-2806C2A7-930A-4828-B012-28E7A67882CD.html'
        },
	{
            identifier: 'c_Manage Attributes_ADM',
            name: 'Manage Attributes',
            page: 'manage-attributes.html',
            helpPage: 'GUID-7FF2F079-2737-42C5-929F-23811B3ED62F.html'
        },
	{
            identifier: 'c_Assay tab_ADM',
            name: 'Assay',
            page: 'assay.html',
            helpPage: 'GUID-CD311B40-5954-4CD9-B0BC-8E3965CDC4C8.html'
        },
	{
            identifier: 'c_Create_ADM',
            name: 'Create',
            page: 'create-assay.html',
            helpPage: 'GUID-3EE2E34B-6107-4F4B-A02D-ED037E48FA6D.html'
        },
	{
            identifier: 'c_Import Assay_ADM',
            name: 'Import Assay',
            page: 'import-assay.html',
            helpPage: 'GUID-02517241-F70E-4B80-9A8B-508709E4772B.html'
        },
	{
            identifier: 'c_Assay Presets_ADM',
            name: 'Presets',
            page: 'assay-presets.html',
            helpPage: 'GUID-E30CD510-2F1D-4DB7-9C0F-AEAC0F8FEB75.html'
        },
	{
            identifier: 'c_Install Templates_ADM',
            name: 'Install Templates',
            page: 'install-templates.html',
            helpPage: 'GUID-BDE091DD-0D7A-4708-B796-E2D0A52E2165.html'
        },
	{
            identifier: 'c_Planned Runs_ADM',
            name: 'Planned Runs',
            page: 'planned-runs.html',
            helpPage: 'GUID-CCF0764A-6627-45B1-B80D-21707982B9FE.html'
        },
	{
            identifier: 'c_Run View_ADM',
            name: 'Run View',
            page: 'run.html',
            helpPage: 'GUID-254ACF93-E10D-4BE9-876F-156F41F652D8.html'
        },
	{
            identifier: 'c_Instrument Status_ADM',
            name: 'Instrument Status',
            page: 'instrument.html',
            helpPage: 'GUID-AD134676-B39C-4DB8-88C2-4EA22FDDF70D.html'
        },
	{
            identifier: 'c_Completed Runs & Results_ADM',
            name: 'Completed Runs & Results',
            page: 'run-result.html',
            helpPage: 'GUID-7A12FD04-84DC-4EDF-8DB4-A1B87DF18B38.html'
        },
	{
            identifier: 'c_Verification Runs_ADM',
            name: 'Verification Runs',
            page: 'verification-run.html',
            helpPage: 'GUID-A9DC6BC1-0BB4-4514-A5EE-1EB5CBBBE1D2.html'
        },
	{
            identifier: 'c_About_ADM',
            name: 'About',
            page: 'about.html',
            helpPage: 'GUID-16502284-2B1B-427B-87B7-6D6BC53469B6.html'
        },
	{
            identifier: 'c_Audit Records_ADM',
            name: 'Audit Records',
            page: 'audit-records.html',
            helpPage: 'GUID-AFFA634C-E296-43CB-8520-5642AAC9AE72.html'
        },
	{
            identifier: 'c_Configuration_ADM',
            name: 'Configuration',
            page: 'configuration.html',
            helpPage: 'GUID-BB2427AB-1C1C-44E4-94F1-FDF4A074A37F.html'
        },
	{
            identifier: 'c_Data Management_ADM',
            name: 'Data Management',
            page: 'data-management.html',
            helpPage: 'GUID-E14B2071-4C33-4B4A-9A3C-62CE2F763520.html'
        },
	{
            identifier: 'c_Logs_ADM',
            name: 'Logs',
            page: 'logs.html',
            helpPage: 'GUID-44313FE7-91AC-4C2B-855A-A2F7DABF5AE8.html'
        },
	{
            identifier: 'c_References_ADM',
            name: 'References',
            page: 'references.html',
            helpPage: 'GUID-3F48A312-7974-4340-865E-6B3ACE499A6D.html'
        },
	{
            identifier: 'c_Services_ADM',
            name: 'Services',
            page: 'services.html',
            helpPage: 'GUID-39A4CCF0-FCA7-4B6D-B1B4-B23E3B6C7649.html'
        },
	{
            identifier: 'c_User Management_ADM',
            name: 'User Management',
            page: 'admin-users.html',
            helpPage: 'GUID-73F65476-1FD3-4B84-ACBC-EEE9BF79964F.html'
        }
    ];

    var _lookup = function(e) {
        var i = 0;
        var len = HelpPages.length;
        for (i; i < len; i++) {
            if (HelpPages[i].page === e) {
                return HelpPages[i].helpPage;
            }
        }
        return "GUID-CFB64E33-7CAD-4BCE-8242-7B833CEC0C4B.html"; //if Help page not found return home page.
    };

    return {
        lookup: _lookup 
    };
});
