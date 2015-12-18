/*global define:false*/
define(['underscore'], function(_) {
    "use strict";
    var _lookup = function(map, e) {
        var keys = _.keys(map);
        var values = _.values(map);
        var i = 0;
        var len = keys.length;
        for (i; i < len; i++) {
            if (i in keys && keys[i] === e) {
                return values[i];
            }
        }
        throw "unknown";
    };

    var ApplicationTypes = {
        DNA: {
            identifier: 'DNA',
            name: 'DNA',
            description: 'Detect and annotate variants in human DNA samples.',
            title: 'About DNA',
            image: 'DNA-Germline-Default-Assay.png'
        },
        RNA: {
            identifier: 'RNA',
            name: 'Fusions',
            description: 'Detect and annotate variants in human Fusions samples.',
            title: 'About Fusions',
            image: 'RNA-Fusion-Assay.png'
        },
        OCP: {
            identifier: 'OCP',
            name: 'OCP50 Default Assay',
            description: 'Detect and annotate variants in human DNA and Fusions samples.',
            title: 'About DNA and Fusions',
            image: 'OCP50-Default-Assay.png'
        }, 
        DNA_SOMATIC: {
            identifier: 'DNA_SOMATIC',
            name: 'DNA Somatic Assay',
            description: 'Detect and annotate somatic variants in human DNA samples.',
            title: 'About DNA and Fusions',
            image: 'DNA-Somatic-Assay.png'
        },
        DNA_RNA: {
            identifier: 'DNA_RNA',
            name: 'DNA and Fusion Assay',
            description: 'Detect and annotate variants in human DNA and Fusions samples.',
            title: 'About DNA and Fusions',
            image: 'DNA-+-RNA-Fusion-Assay.png'
        },
        lookup: function(e) {
            return _lookup(this, e);
        }
    };

	var SpecimenGroups = {
		SINGLE: {
			identifier: 'SINGLE',
			name: 'Single',
			description: 'Analyze a single sample.',
			title: 'About Single',
			image: 'analysis-single.png'
		},
		DNA_RNA_FUSION: {
            identifier: 'DNA_RNA_FUSION',
            name: 'DNA and Fusions',
            description: 'Analyze a single DNA sample and a Fusions sample',
            title: 'About DNA Sample and Fusions Sample',
            image: 'analysis-dna-rna.png'
        },
		lookup: function(e) {
			return _lookup(this, e);
		}

    };

    return {
        ApplicationTypes: ApplicationTypes,
        SpecimenGroups: SpecimenGroups
    };
});