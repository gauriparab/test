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
        DNA_RNA: {
            identifier: 'DNA_RNA',
            name: 'DNA and Fusions',
            description: 'Detect and annotate variants in human DNA and Fusions samples.',
            title: 'About DNA and Fusions',
            image: 'DNA-+-RNA-Fusion-Assay.png'
        },
        METAGENOMICS: {
            identifier: 'METAGENOMICS',
            name: 'Metagenomics',
            description: 'Determine population diversity in 16s samples.',
            title: 'About Metagenomics',
            image: 'analysis-metagenomics.png'
        },
        ANNOTATE_VARIANTS: {
            identifier: 'ANNOTATE_VARIANTS',
            name: 'Annotate Variants',
            description: 'Annotate the variants from a VCF file.',
            title: 'About Annotate Variants',
            image: 'analysis-annotation.png'
        },
        ANEUPLOIDY: {
            identifier: 'ANEUPLOIDY',
            name: 'Aneuploidy',
            description: 'Detect chromosomal abnormalities in low-pass whole-genome sequencing samples.',
            title: 'About Aneuploidy',
            image: 'analysis-aneuploidy.png'
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
		SINGLE_RNA_FUSION: {
			identifier: 'SINGLE_RNA_FUSION',
			name: 'Single Fusions',
			description: 'Analyze a single Fusions sample.',
			title: 'About Single Fusions',
			image: 'analysis-rna.png'
		},
		PAIRED: {
			identifier: 'PAIRED',
			name: 'Paired',
			description: 'Analyze and compare two samples.',
			title: 'About Paired',
			image: 'analysis-paired.png'
		},
        PAIRED_TUMOR_NORMAL: {
            identifier: 'PAIRED_TUMOR_NORMAL',
            name: 'Tumor-Normal',
            description: 'Identify somatic mutations using advanced statistical approaches.',
            title: 'About Tumor-Normal',
            image: 'analysis-paired-tn.png'
        },
		MULTI: {
			identifier: 'MULTI',
			name: 'Single / Multi',
			description: 'Determine the microbial diversity of a 16S sample in one or more samples.',
			title: 'About Single / Multi',
			image: 'analysis-population.png'
		},
		TRIO: {
			identifier: 'TRIO',
			name: 'Trio',
			description: 'Analyze a trio of a mother, father, and proband.',
			title: 'About Trio',
			image: 'analysis-trios.png'
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