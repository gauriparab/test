/* global define:false */
define(["jquery"], function ($) {
    "use strict";
    
    /**
     * Launch the IGV servlet on the Variant Review Screen.
     * 
     * @param {String}
     *                locus The location on the chromosome (such as chr1:12345)
     *                or the name of the gene(s) or fusion name(s) to view (such
     *                as ATL1 or a list of fusion names or genes, which would
     *                open a split view)
     * @param {String}
     *                analysis_dir The location of the analysis output folder on
     *                the server side (such as /data/IR/somefolder/someanalysis)
     * @param {String}
     *                servlet_url The URL to the IGV servlet, such as
     *                http://server/IgvServlet?igv
     * @param {String}
     *                authtoken The security token to set in the header of the
     *                call so that IgvServlet knows if the call is authorized or
     *                not
     * @param {Number}
     *                [port] (optional) The port number to communicate with a
     *                possibly running IGV instance on the client side (to reuse
     *                the instance if user changes the location). Each port
     *                number corresponds to one instance. That way multiple
     *                instances can be open at the same time (and be updated
     *                correctly based on the link the user clicks on)
     * @param {String}
     *                [variant_type] (optional) A type of the locus or variant
     *                to help IGV or the IGVServlet decide how to do the layout
     *                and what references to use etc Examples include (but is
     *                not limited to): FUSION, SNV, REF, INDEL, CNV, NOCALL,
     *                EXPR_CONTROL, ASSAYS_5P_3P
     * @param {String}
     *                [variant_id] (optional) An ID that contains information
     *                about the gene, fusion or variant, including:
     *                AGTRAP-BRAF.A5B8.COSF828,
     *                RET.5p_NM_020975.4.e6e7,RET.3p_NM_020975.4.e18e19
     * @author chetan_gole, Chantal Roth
     */
	    function callIGV(locus, analysis_dir, servlet_url, authtoken, port, sample, variant_type, variant_id) {
			if (port === undefined){
				port = "60151";
		    }
			var localurl = "http://localhost:" + port + "/get?hash&nosleep";
			var gotourl = "http://localhost:" + port + "/goto?locus=" + locus;
			var closeUrl = "http://localhost:" + port + "/exit";

			$.ajax({
				url : localurl
			}).done(
				function(servletData) {
					// the IGV client is open. Check to see if the same analysis
					// dir is being viewed
					if (servletData != null)
						servletData = servletData.trim();

					if (analysis_dir == servletData) {
						$.ajax(gotourl);
					}
					// IGV client open, but viewing different analysis
					else {
						// console.log("Analyses are not the same: " +
						// analysis_dir + "
						// != " + servletData);
						// close the old window and open a new window
						$.ajax(closeUrl).always(
								function() {
									openServlet(locus, analysis_dir, servlet_url, authtoken, port, sample, variant_type, variant_id);
								});
					}
				}).fail(
				function(e) {
					// failure here means the IGV client is not open yet, so
					// call the
					// servlet, which launches IGV
					// console.log("IGV is probably not running:" +
					// JSON.stringify(e));
					openServlet(locus, analysis_dir, servlet_url, authtoken, port, sample, variant_type, variant_id);
				});
	};

    function openServlet(locus, analysis_dir, servlet_url, authtoken, port, sample, variant_type, variant_id) {
    	if (!variant_type) variant_type = "";
    	if (!variant_id) variant_id = "";
        var url = servlet_url + "?" + $.param({
            port: port,
            analysis_dir: analysis_dir,
            hash: analysis_dir,
            sample:sample,
            nosleep: true
        });
        
        url += '&locus='+locus;
        
        $.ajax({
            url: url,
            type: 'GET',
            beforeSend: function(xhr, settings){
              xhr.setRequestHeader("Authorization", authtoken);
            },
            headers: { "Authorization": authtoken }
        }).done(function() {
            openInFrame(url);
        });
    }
    
    function openInFrame(url) {
        var iframe = $('#servlet-iframe');
        if (!iframe.length) {
            iframe = $('<iframe></iframe>', {
                id: 'servlet-iframe',
                name: 'servlet-iframe'
            }).hide().appendTo($('body'));
        }
        iframe.prop('src', url);
    }

    return {
        callIGV: callIGV
    };
});
