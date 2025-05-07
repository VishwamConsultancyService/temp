<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SharedFlow name="default">
    <Step>
        <Name>JS-BuildLogMessage</Name>
    </Step>
    <Step>
        <Name>AM-Remove-Server-Header</Name>
    </Step>
</SharedFlow>

-----

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Javascript async="false" continueOnError="false" enabled="true" timeLimit="200" name="JS-BuildLogMessage">
    <DisplayName>JS-BuildLogMessage</DisplayName>
    <Properties/>
    <IncludeURL>jsc://JS-MaskFunctions.js</IncludeURL>
    <ResourceURL>jsc://JS-BuildLogMessage.js</ResourceURL>
</Javascript>

    -----

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<AssignMessage async="false" continueOnError="false" enabled="true" name="AM-Remove-Server-Header">
    <DisplayName>AM-Remove Server Header</DisplayName>
    <Properties/>
    <Remove>
        <Headers>
            <Header name="Server"/>
        </Headers>
    </Remove>
    <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
    <AssignTo createNew="false" transport="http" type="request"/>
</AssignMessage>


    -----


    try {
	var js_maskConfig = JSON.parse(context.getVariable("api.sf.kvm.logConfig")).dataMask.maskConfig;
    var js_toMask = context.getVariable("api.maskLog");
	
    if (context.getVariable("api.logLevel"))
        var js_logMessage = 'logLevel=' + context.getVariable("api.logLevel");
    else {
        var js_logMessage = 'logLevel=ALL';
        context.setVariable("api.logLevel", "ALL");
    }
    if (context.getVariable("api.statusCode"))
        var js_responseCode = context.getVariable("api.statusCode").toString();
    else if (context.getVariable("message.status.code"))
        var js_responseCode = context.getVariable("message.status.code").toString();
	else
		var js_responseCode = "200";
	
	//	QC-9612, QC-11314 - MaintenanceMode responses (HTTP 307) to be marked as errors
    if (js_responseCode === ("307") || js_responseCode.startsWith("4") || js_responseCode.startsWith("5")) {
        js_logMessage += '||' +  'logType=ERROR';
        var js_logType = 'ERROR';
    } else{
        js_logMessage += '||' +  'logType=SUCCESS';
        var js_logType = 'SUCCESS';
    }
    if (js_responseCode.startsWith("4"))
        js_logMessage += '||' +  'errorType=CLIENT';
    if (js_responseCode.startsWith("5")) {
        js_logMessage += '||' +  'errorType=SERVER';
        js_logMessage += '||' +  'errorContent=' + context.getVariable("error.content").replace(/[\n\r]/g,"");
    }
    if (context.getVariable("api.faultMessage"))
        js_logMessage += '||' +  'faultMessage=' + context.getVariable("api.faultMessage").replace(/[\n\r]/g,"");
        
    js_logMessage += '||' +  'proxyResponseStatusCode=' + js_responseCode;
    
    js_logMessage += '||' +  'proxyName=' + context.getVariable("apiproxy.name");
    if (context.getVariable("api.flowName"))
        js_logMessage += '||' +  'apiName=' + context.getVariable("api.flowName");
    js_logMessage += '||' +  'systemTimestamp=' + context.getVariable("system.timestamp");
    js_logMessage += '||' +  'organization=' + context.getVariable("organization.name");

    var current_environment = context.getVariable("environment.name");
    switch (current_environment) {
    case 'prod':
        current_environment = 'prod-beam';
        break;
    case 'dev':
        current_environment = 'intg-beam';
        break;
    case 'test':
        current_environment = 'acpt-beam';
        break;
    case 'unit':
        current_environment = 'unit-beam';
        break;
    default:
        current_environment = 'undefined';
    }

    js_logMessage += '||' +  'environment=' + current_environment;
    
    js_logMessage += '||' +  'messageId=' + context.getVariable("messageid");
    
    if (context.getVariable("private.api.header.correlationContextId") && context.getVariable("private.api.header.correlationContextId") !== "")
        js_logMessage += '||' +  'correlationContextId=' + context.getVariable("private.api.header.correlationContextId"); 
    if (context.getVariable("private.api.header.proxyContentType") && context.getVariable("private.api.header.proxyContentType") !== "")
        js_logMessage += '||' +  'proxyRequestContentType=' + context.getVariable("private.api.header.proxyContentType");
    if (context.getVariable("private.api.header.proxyAccept") && context.getVariable("private.api.header.proxyAccept") !== "")
        js_logMessage += '||' +  'proxyRequestAcceptType=' + context.getVariable("private.api.header.proxyAccept");
    if (context.getVariable("private.api.header.proxyUserAgent") && context.getVariable("private.api.header.proxyUserAgent") !== "")
        js_logMessage += '||' +  'proxyRequestUserAgent=' + context.getVariable("private.api.header.proxyUserAgent");
    if (context.getVariable("private.api.header.xForwardedFor") && context.getVariable("private.api.header.xForwardedFor") !== "")
        js_logMessage += '||' +  'proxyRequestXForwardedFor=' + context.getVariable("private.api.header.xForwardedFor");    
        js_logMessage += '||' +  'proxyClientIp=' + context.getVariable("proxy.client.ip");
    
    if (context.getVariable("private.api.proxyRequestVerb"))
        js_logMessage += '||' +  'proxyRequestVerb=' + context.getVariable("private.api.proxyRequestVerb");
    if (context.getVariable("private.api.proxyRequestUri"))
        js_logMessage += '||' +  'proxyRequestUri=' + context.getVariable("private.api.proxyRequestUri");    
        
    js_logMessage += '||' +  'clientReceivedStartTimestamp=' + context.getVariable("client.received.start.timestamp");
    js_logMessage += '||' +  'clientReceivedEndTimestamp=' + context.getVariable("client.received.end.timestamp");
    
    //Mask all query parameter values in target url
    if (context.getVariable("private.api.targetRequestUrl") && js_toMask.toUpperCase() === "TRUE"){
        js_logMessage += '||' +  'targetRequestUrl=' + maskQueryParams(context.getVariable("private.api.targetRequestUrl"));}
    else if(context.getVariable("private.api.targetRequestUrl")){
        js_logMessage += '||' +  'targetRequestUrl=' + context.getVariable("private.api.targetRequestUrl");
    }    
    if (context.getVariable("target.received.start.timestamp"))
        js_logMessage += '||' +  'targetReceivedStartTimestamp=' + context.getVariable("target.received.start.timestamp");
    if (context.getVariable("target.received.end.timestamp"))
        js_logMessage += '||' +  'targetReceivedEndTimestamp=' + context.getVariable("target.received.end.timestamp");
    if (context.getVariable("target.sent.start.timestamp"))
        js_logMessage += '||' +  'targetSentStartTmestamp=' + context.getVariable("target.sent.start.timestamp");
    if (context.getVariable("target.sent.end.timestamp"))
        js_logMessage += '||' +  'targetSentEndTimestamp=' + context.getVariable("target.sent.end.timestamp");
        
    if (context.getVariable("target.received.end.timestamp") && context.getVariable("target.sent.start.timestamp")){
        var js_targetTimeTaken = Number(context.getVariable("target.received.end.timestamp"))-Number(context.getVariable("target.sent.start.timestamp"));
    }
    if (context.getVariable("private.api.targetResponseStatusCode"))
        js_logMessage += '||' +  'targetResponseStatusCode=' + context.getVariable("private.api.targetResponseStatusCode");
    if (context.getVariable("private.api.targetResponseReasonPhrase"))
        js_logMessage += '||' +  'targetResponseReasonPhrase=' + context.getVariable("private.api.targetResponseReasonPhrase");
    var js_apiTotalTimeTaken = Number(context.getVariable("system.timestamp") - Number(context.getVariable("client.received.start.timestamp")));
    var js_apiTimeTaken = js_apiTotalTimeTaken;
    if (js_targetTimeTaken){
    js_apiTimeTaken -= js_targetTimeTaken;
    js_logMessage += '||' +  'targetTimeTakenInMs=' + js_targetTimeTaken;    
    }
	
	/* Callout details - START*/
	var js_logCalloutsMessage = "";
    var js_calloutsTimeTaken = 0;
    var js_serviceCallouts = context.getVariable("api.servicecallouts");
    if(js_serviceCallouts){
        js_serviceCallouts.forEach(function(serviceCallout) {
            var js_policy = String(serviceCallout.calloutPolicyName).trim();
            var js_policyRequestVariable = String(serviceCallout.calloutPolicyRequestVariable).trim();
            var js_policyResponseVariable = String(serviceCallout.js_policyResponseVariable).trim();
            
            if(context.getVariable(js_policyRequestVariable + ".verb")){
                
                var js_calloutTimeTaken = context.getVariable("apigee.metrics.policy." + js_policy + ".timeTaken");
                var js_url = context.getVariable(js_policyRequestVariable + ".url");
                var js_verb = context.getVariable(js_policyRequestVariable + ".verb");
                
                var js_policyRequestVariableContent = context.getVariable(js_policyRequestVariable + ".content");
                var js_policyResponseVariableContent = context.getVariable(js_policyResponseVariable +  ".content");
                var js_policyResponseVariableStatusCode = context.getVariable(js_policyResponseVariable +  ".status.code");
                
                var js_logCalloutMessage = '{';
                js_logCalloutMessage += '"callout.'+ js_policy + '.verb":"'+ context.getVariable(js_policyRequestVariable + ".verb") + '",';
                js_logCalloutMessage += '"callout.'+ js_policy + '.url":"'+ context.getVariable(js_policyRequestVariable + ".url") + '",';
                
                if ((context.getVariable("api.logLevel").toUpperCase() !== 'NOPAYLOAD' && context.getVariable("api.logLevel").toUpperCase() != 'NOTARGETPAYLOAD')
                    && (!(context.getVariable("api.logLevel").toUpperCase() == 'ERROR' && js_logType === 'SUCCESS'))){
            			if(js_policyRequestVariableContent && js_toMask.toUpperCase() == "TRUE")
            			    js_logCalloutMessage += '"callout.'+ js_policy + '.request":"' + apiMaskData(js_policyRequestVariableContent,js_maskConfig) + '",';
            			else
            			    js_logCalloutMessage += '"callout.'+ js_policy + '.request":"' + js_policyRequestVariableContent + '",';
            			    
            		    if(js_policyResponseVariableContent && js_toMask.toUpperCase() == "TRUE")
            			    js_logCalloutMessage += '"callout.'+ js_policy + '.response":"'+ apiMaskData(js_policyResponseVariableContent,js_maskConfig) + '",';
            			else
            			    js_logCalloutMessage += '"callout.'+ js_policy +'.response":"'+ js_policyResponseVariableContent + '",';
                }
                if(js_policyResponseVariableStatusCode){
                        js_logCalloutMessage += '"callout.'+ js_policy +'.responseStatusCode":"' + js_policyResponseVariableStatusCode + '",';
                }
                js_logCalloutMessage += '"callout.'+ js_policy + '.timeTakenInNs":"'+ js_calloutTimeTaken + '"}';
				
				if(js_logCalloutsMessage !== "")
					js_logCalloutsMessage = js_logCalloutsMessage + ',' + js_logCalloutMessage;
				else
                    js_logCalloutsMessage = js_logCalloutMessage;
				
                if(js_calloutsTimeTaken !== 0 && js_calloutTimeTaken)
                    js_calloutsTimeTaken = js_calloutsTimeTaken + js_calloutTimeTaken;
                else
                    js_calloutsTimeTaken = js_calloutTimeTaken;
            }
        });
    }
	/* Callout details - END*/
	if (js_logCalloutsMessage !== ""){
        var js_ms_calloutsTimeTaken = Math.floor(Number(js_calloutsTimeTaken)/1000000);
        js_apiTimeTaken -= js_ms_calloutsTimeTaken;   
        js_logMessage += '||' +  'calloutsTimeTakenInMs=' + js_ms_calloutsTimeTaken; 
    }
    js_logMessage += '||' +  'apiTimeTakenInMs=' + js_apiTimeTaken;
    js_logMessage += '||' +  'apiTotalTimeTakenInMs=' + js_apiTotalTimeTaken;
    
    if (context.getVariable("api.logLevel").toUpperCase() != 'NOPAYLOAD'
    && (!(context.getVariable("api.logLevel").toUpperCase() == 'ERROR' && js_logType == 'SUCCESS'))) {
		if(js_toMask.toUpperCase() === "TRUE"){
		    if (context.getVariable("private.api.proxyRequestContent"))
				js_logMessage += '||' +  'proxyRequest=' +  apiMaskData(context.getVariable("private.api.proxyRequestContent"),js_maskConfig);
			if (js_logType === 'ERROR') {
				if (context.getVariable("api.errorPayload") && context.getVariable("api.errorPayload") !== "")
					js_logMessage += '||' +  'proxyResponse=' + apiMaskData(context.getVariable("api.errorPayload"),js_maskConfig);
				else if(context.getVariable("message.content"))
					js_logMessage += '||' +  'proxyResponse=' + apiMaskData(context.getVariable("message.content"),js_maskConfig);
			} else if(context.getVariable("message.content")){
			    js_logMessage += '||' +  'proxyResponse=' + apiMaskData(context.getVariable("message.content"),js_maskConfig);
			}
				
			if (context.getVariable("api.logLevel").toUpperCase() != 'NOTARGETPAYLOAD') {
				if (context.getVariable("private.api.targetRequestContent"))
					js_logMessage += '||' +  'targetRequest=' + apiMaskData(context.getVariable("private.api.targetRequestContent"),js_maskConfig);
				if (context.getVariable("private.api.targetResponseContent"))
					js_logMessage += '||' +  'targetResponse=' + apiMaskData(context.getVariable("private.api.targetResponseContent"),js_maskConfig);
			}
		}else{
			if (context.getVariable("private.api.proxyRequestContent"))
				js_logMessage += '||' +  'proxyRequest=' +  context.getVariable("private.api.proxyRequestContent");
			if (js_logType === 'ERROR') {
				if (context.getVariable("api.errorPayload") && context.getVariable("api.errorPayload") !== "")
					js_logMessage += '||' +  'proxyResponse=' + context.getVariable("api.errorPayload");
				else if(context.getVariable("message.content"))
					js_logMessage += '||' +  'proxyResponse=' + context.getVariable("message.content");
			} else if(context.getVariable("message.content"))
				js_logMessage += '||' +  'proxyResponse=' + context.getVariable("message.content");
			if (context.getVariable("api.logLevel").toUpperCase() != 'NOTARGETPAYLOAD') {
				if (context.getVariable("private.api.targetRequestContent"))
					js_logMessage += '||' +  'targetRequest=' + context.getVariable("private.api.targetRequestContent");
				if (context.getVariable("private.api.targetResponseContent"))
					js_logMessage += '||' +  'targetResponse=' + context.getVariable("private.api.targetResponseContent");
			}
		}
    }
    if (context.getVariable("api.customLogMessage") && context.getVariable("api.customLogMessage") !== "")
        js_logMessage += '||' +  context.getVariable("api.customLogMessage").replace(/[\n\r]/g,"");
        
    if (js_logCalloutsMessage)
        js_logMessage += '||' +  'callouts=[' + js_logCalloutsMessage + ']';
	if (context.getVariable("api.javascriptError"))
        js_logMessage += '||' +  'javascriptError=[' + context.getVariable("api.javascriptError") + ']';
        
    context.setVariable("api.logMessage", js_logMessage);
    if(context.getVariable("api.logLevel") && context.getVariable("api.logLevel").toUpperCase() == 'NONE'){
        context.setVariable("api.logMessage", "");
    }
} catch (err) {
    context.setVariable("api.logMessage", js_logMessage + " | Error in JS-BuildLogMessage.js in PostProxyOperations-sf-v1: "+ err);
}


----

       	var js_maskXMLData = function(strXML, maskConfigData) {
	    if (strXML === null) {
	        strXML = '';
			return strXML;
	    }
	    for (var data in maskConfigData) {
	        var elementToMask = maskConfigData[data].tagToMask;
	        var maskChar = maskConfigData[data].maskChar;
	        var keepLastChars = Number(maskConfigData[data].keepLastChars);
	        var maskingStr = '';
			var attributeToMask = '';
	        if (elementToMask.indexOf('/@') > -1) {
	            attributeToMask = elementToMask.split('@')[1];
	            elementToMask = elementToMask.split('/')[0];
	        }
	        var splitStr = strXML.split(elementToMask+">")[0].split('<').pop().trim();
			var namespace = '';
	        if (splitStr.slice(-1) === ':') {
	            namespace = splitStr.substr(0, splitStr.indexOf(':'));
	        } 

	        if (namespace && attributeToMask) {
	            strRegExPattern = '<' + namespace + ':' + elementToMask + '(.*?)' + attributeToMask + '=\"(.*?)"(.*?)>(.*?)</' + namespace + ':' + elementToMask + '>';
	        } else if (namespace) {
	            strRegExPattern = '<' + namespace + ':' + elementToMask + '(.*?)>(.*?)</' + namespace + ':' + elementToMask + '>';
	        } else if (attributeToMask) {
	            strRegExPattern = '<' + elementToMask + '(.*?)' + attributeToMask + '=\"(.*?)"(.*?)>(.*?)</' + elementToMask + '>';
	        } else {
	            strRegExPattern = '<' + elementToMask + '(.*?)>(.*?)</' + elementToMask + '>';
	        }

	        var matches = strXML.match(new RegExp(strRegExPattern, 'g'));
	        if (matches) {
				//Masking Attributes
	            if (attributeToMask) { 
	                var attrRegExPatternXML;
                  if (namespace) {
	                    attrRegExPatternXML = '<' + namespace + ':' + elementToMask + '(.*?)' + attributeToMask + '="' + '(.*?)' + '"';
	                } else {
	                    attrRegExPatternXML = '<' + elementToMask + '(.*?)' + attributeToMask + '="' + '(.*?)' + '"';
	                }
	                attributeToMask = '';
	                var tagMatch = strXML.match(new RegExp(attrRegExPatternXML, 'g'));
	                if (tagMatch) {
	                    for (var i = 0; i < tagMatch.length; i++) {
	                        var arrElem = tagMatch[i].split("=");
	                        var attributeToMaskValue = arrElem[1];
	                        var count = 1;
	                        if (attributeToMaskValue.length > keepLastChars) {
	                            count = attributeToMaskValue.length - keepLastChars - 1;
	                            for (var a = 0; a < count - 1; a++) {
	                                if (!maskingStr) {
	                                    maskingStr = maskChar;
	                                } else {
	                                    maskingStr = maskingStr + maskChar;
	                                }
	                            }
	                            var maskedAttribute = tagMatch[i].replace(attributeToMaskValue.substring(1, count), maskingStr);
	                            maskingStr = '';
							    //replacing the masked attribute value within the original xmlString.
	                            strXML = strXML.replace(tagMatch[i], maskedAttribute);
	                        }
	                    }
	                }
	            } else {
					//Masking Elements
	                for (var i = 0; i < matches.length; i++) {
	                    var elementToMaskValue = matches[i].substring(matches[i].indexOf(">") + 1, matches[i].indexOf("</"));
	                    var count = 1;
	                    if (elementToMaskValue.length > keepLastChars) {
	                        count = elementToMaskValue.length - keepLastChars;
	                        for (var a = 0; a < count; a++) {
	                            if (!maskingStr) {
	                                maskingStr = maskChar;
	                            } else {
	                                maskingStr = maskingStr + maskChar;
	                            }
	                        }
	                        var maskedElement = matches[i].replace(elementToMaskValue.substring(0, count), maskingStr);
	                        maskingStr = '';
	                        //replacing the masked element value within the original xmlString.
	                        strXML = strXML.replace(matches[i], maskedElement);
	                    }
	                }
	            } // End else
	        } // End if(matches)
	    } // End for (var data in maskConfigData)
	    return strXML;
	}

	var js_maskJSONData = function(strJSON, maskConfigData) {
	    var jsonObj=JSON.parse(strJSON);
	    strJSON = JSON.stringify(jsonObj);
		for (var data in maskConfigData) {
	        var tagToMask = maskConfigData[data].tagToMask;
	        var maskChar = maskConfigData[data].maskChar;
	        var keepLastChars = Number(maskConfigData[data].keepLastChars);
			var maskingStr = '';
	        //Checking for the path of the attributes
	        if (tagToMask.indexOf('/') > -1) {
	            if (tagToMask.indexOf('@') > -1) {
	                var pathOfElement = tagToMask.split("/");
	                var paretnElement = pathOfElement[0];
	                var TagToBeMasked = pathOfElement[pathOfElement.length - 1];
	                var strRegExPatternJSON = '"' + paretnElement + '":' + '(.*?)' + '{' + '"' + TagToBeMasked + '":' + '(.*?)' + '(,|})';
	                var tagMatch = strJSON.match(new RegExp(strRegExPatternJSON, 'g'));
	                if (tagMatch) {
	                    for (var i = 0; i < tagMatch.length; i++) {
	                        var lastChar = '}';
	                        //Checking weather it is simple element with attribute or complex element with attribute
	                        if (tagMatch[i].indexOf(',') > -1) {
	                            lastChar = ',';
	                        }
	                        var attrRegExPattern = '"' + TagToBeMasked + '":' + '(.*?)' + lastChar;
	                        var matchesAttr = tagMatch[i].match(new RegExp(attrRegExPattern, 'g'));
	                        if (matchesAttr) {
	                            for (var j = 0; j < matchesAttr.length; j++) {
	                                var prefix = matchesAttr[j].substring(0, matchesAttr[j].indexOf("\":"));
	                                var elementToBeMasked = matchesAttr[j].split("\":").pop().split(lastChar).shift();
	                                var maskedElement = '';
	                                if (elementToBeMasked.length > keepLastChars) {
	                                    var count = elementToBeMasked.length - keepLastChars;
	                                    if (elementToBeMasked.indexOf("\"") == -1) {
	                                        //element to be masked is an integer
	                                        for (var a = 0; a < count; a++) {
	                                            if (!maskingStr) {
	                                                //maskingStr = '*';
	                                                maskingStr = maskChar;
	                                            } else {
	                                                //maskingStr = maskingStr + '*';
	                                                maskingStr = maskingStr + maskChar;
	                                            }
	                                        }
	                                        maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count), maskingStr) + "\"";
	                                        maskingStr = '';
	                                    } else {
	                                        //element to be masked is a string
	                                        for (var a = 0; a < count - 2; a++) {
	                                            if (!maskingStr) {
	                                                //maskingStr = '*';
	                                                maskingStr = maskChar;
	                                            } else {
	                                                //maskingStr = maskingStr + '*';
	                                                maskingStr = maskingStr + maskChar;
	                                            }
	                                        }
	                                        maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count - 1), maskingStr);
	                                        maskingStr = '';
	                                    }
	                                } else {
	                                    //elementToBeMasked.length <= keepLastChars
	                                    maskedElement = elementToBeMasked;
	                                }
	                                //Replace the masked String in the parent json
	                                strJSON = strJSON.replace(matchesAttr[j], prefix + "\":" + maskedElement + lastChar);
	                            }
	                        }
	                    }
	                }
	            }
	        } else {
                //Expression to get all the data to be masked
                var strRegExPatternJSON = '"' + tagToMask + '":' + '(.*?)' + '(,|})';
	            var tagMatch = strJSON.match(new RegExp(strRegExPatternJSON, 'g'));
	            
	            //List created to ensure, repeated elements are not processed
	            var listOfElements = new Array();
	            if (tagMatch) {
	                for (var i = 0; i < tagMatch.length; i++) {
	                    if (tagMatch[i].indexOf('{') > -1) {
	                        //Element to be masked contains an attribute 
	                        if (tagMatch[i].indexOf('[') > -1) {
	                            //Element to be masked contains an attribute and is an array								
	                            var arrRegExPatternJSON = '"' + tagToMask + '":\\[{' + '(.*?)' + '#text' + '(.*?)' + '\\]';
	                            var attrArrMatch = strJSON.match(new RegExp(arrRegExPatternJSON, 'g'));
	                            if (attrArrMatch) {
	                                for (var j = 0; j < attrArrMatch.length; j++) {
	                                    if (listOfElements.indexOf(attrArrMatch[j]) == -1) {
	                                        //Get the individual array elements
	                                        var attrArrayRegExPattern = '{' + '(.*?)' + '}';
	                                        var matchesAttrArr = attrArrMatch[j].match(new RegExp(attrArrayRegExPattern, 'g'));
	                                        if (matchesAttrArr) {
	                                            //Mask Individual Object in array
	                                            for (var k = 0; k < matchesAttrArr.length; k++) {
	                                                var prefix = matchesAttrArr[k].substring(0, matchesAttrArr[k].indexOf("#text\":"));
	                                                var elementToBeMasked = matchesAttrArr[k].split("#text\":").pop().split("}").shift();
	                                                var maskedElement = '';
	                                                if (elementToBeMasked.length > keepLastChars) {
	                                                    var count = elementToBeMasked.length - keepLastChars;
	                                                    if (elementToBeMasked.indexOf("\"") == -1) {
	                                                        //element to be masked is an integer
	                                                        for (var a = 0; a < count; a++) {
	                                                            if (!maskingStr) {
	                                                                //maskingStr = '*';
	                                                                maskingStr = maskChar;
	                                                            } else {
	                                                                //maskingStr = maskingStr + '*';
	                                                                maskingStr = maskingStr + maskChar;
	                                                            }
	                                                        }
	                                                        maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count), maskingStr) + "\"";
	                                                        maskingStr = '';
	                                                    } else {
	                                                        //element to be masked is a string
	                                                        for (var a = 0; a < count - 2; a++) {
	                                                            if (!maskingStr) {
	                                                                //maskingStr = '*';
	                                                                maskingStr = maskChar;
	                                                            } else {
	                                                                //maskingStr = maskingStr + '*';
	                                                                maskingStr = maskingStr + maskChar;
	                                                            }
	                                                        }
	                                                        maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count - 1), maskingStr);
	                                                        maskingStr = '';
	                                                    }
	                                                } else {
	                                                    //elementToBeMasked.length <= keepLastChars
	                                                    maskedElement = elementToBeMasked;
	                                                }
	                                                //Replace the masked String in the parent json
	                                                strJSON = strJSON.replace(matchesAttrArr[k], prefix + "#text\":" + maskedElement + "}");
	                                            }
	                                        }
	                                        listOfElements.push(attrArrMatch[j]);
	                                    }
	                                }
	                            }
	                        } else {
	                            //Element to be masked is a single object and contains Attribute
	                            var arrRegExPatternJSON = '"' + tagToMask + '":{' + '(.*?)' + '#text' + '(.*?)' + '(,|})';
	                            var attrMatch = strJSON.match(new RegExp(arrRegExPatternJSON, 'g'));
	                            if (attrMatch) {
	                                for (var j = 0; j < attrMatch.length; j++) {
	                                    if (listOfElements.indexOf(attrMatch[j]) == -1) {
	                                        var prefix = attrMatch[j].substring(0, attrMatch[j].indexOf("#text\":"));
	                                        var elementToBeMasked = attrMatch[j].split("#text\":").pop().split("}").shift();
	                                        var maskedElement = '';
	                                        if (elementToBeMasked.length > keepLastChars) {
	                                            var count = elementToBeMasked.length - keepLastChars;
	                                            if (elementToBeMasked.indexOf("\"") == -1) {
	                                                //element to be masked is an integer												
	                                                for (var a = 0; a < count; a++) {
	                                                    if (!maskingStr) {
	                                                        //maskingStr = '*';
	                                                        maskingStr = maskChar;
	                                                    } else {
	                                                        //maskingStr = maskingStr + '*';
	                                                        maskingStr = maskingStr + maskChar;
	                                                    }
	                                                }
	                                                maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count), maskingStr) + "\"";
	                                                maskingStr = '';
	                                            } else {
	                                                //element to be masked is a string												
	                                                for (var a = 0; a < count - 2; a++) {
	                                                    if (!maskingStr) {
	                                                        //maskingStr = '*';
	                                                        maskingStr = maskChar;
	                                                    } else {
	                                                        //maskingStr = maskingStr + '*';
	                                                        maskingStr = maskingStr + maskChar;
	                                                    }
	                                                }
	                                                maskedElement = "\"" + elementToBeMasked.replace(elementToBeMasked.substring(0, count - 1), maskingStr);
	                                                maskingStr = '';
	                                            }
	                                        } else {
	                                            //elementToBeMasked.length <= keepLastChars
	                                            maskedElement = elementToBeMasked;
	                                        }
	                                        listOfElements.push(attrMatch[j]);
	                                        //Replace the masked String in the parent json
	                                        strJSON = strJSON.replace(attrMatch[j], prefix + "#text\":" + maskedElement + "}");
	                                    }
	                                }
	                            }
	                        }
	                    } else {
	                        //Element to be masked doesnt contain an attribute
	                        if (tagMatch[i].indexOf('[') > -1) {
	                            //Element to be masked is an array
	                            var arrRegExPatternJSON = '"' + tagToMask + '":' + '\\[' + '(.*?)' + '\\]';
	                            var arrMatch = strJSON.match(new RegExp(arrRegExPatternJSON, 'g'));
	                            if (arrMatch) {
	                                for (var j = 0; j < arrMatch.length; j++) {
	                                    //Condition to extract only Array with no attributes
	                                    if (arrMatch[j].indexOf('{') == -1) {
	                                        if (listOfElements.indexOf(arrMatch[j]) == -1) {
	                                            listOfElements.push(arrMatch[j]);
	                                            var txtcount = arrMatch[j].split("\"").length - 1;
	                                            if (txtcount > 2) {
	                                                //Array of Strings
	                                                var strArr = arrMatch[j].split("[").pop().split("]").shift();
	                                                var arrElem = strArr.split(",");
	                                                var maskedElement = '';
	                                                for (var k = 0; k < arrElem.length; k++) {

	                                                    var count = 1;
	                                                    if (arrElem[k].length > keepLastChars) {
	                                                        count = arrElem[k].length - keepLastChars - 1;
	                                                    }
	                                                    for (var a = 0; a < count - 1; a++) {
	                                                        if (!maskingStr) {
	                                                            //maskingStr = '*';
	                                                            maskingStr = maskChar;
	                                                        } else {
	                                                            //maskingStr = maskingStr + '*';
	                                                            maskingStr = maskingStr + maskChar;
	                                                        }
	                                                    }
	                                                    maskedElement = maskedElement + arrElem[k].replace(arrElem[k].substring(1, count), maskingStr);
	                                                    maskingStr = '';
	                                                    if (k != arrElem.length - 1) {
	                                                        maskedElement = maskedElement + ",";
	                                                    }
	                                                }
	                                                //Replace the masked String in the parent json
	                                                strJSON = strJSON.replace(arrMatch[j], "\"" + tagToMask + "\": [" + maskedElement + "]");
	                                            } else {
	                                                //Array of Integers
	                                                var intArr = arrMatch[j].split("[").pop().split("]").shift();
	                                                var arrElem = intArr.split(",");
	                                                var maskedElement = '[';
	                                                for (var k = 0; k < arrElem.length; k++) {
	                                                    var count = 1;
	                                                    if (arrElem[k].length > keepLastChars) {
	                                                        count = arrElem[k].length - keepLastChars;
	                                                    }

	                                                    for (var a = 0; a < count; a++) {
	                                                        if (!maskingStr) {
	                                                            //maskingStr = '*';
	                                                            maskingStr = maskChar;
	                                                        } else {
	                                                            //maskingStr = maskingStr + '*';
	                                                            maskingStr = maskingStr + maskChar;
	                                                        }
	                                                    }
	                                                    maskedElement = maskedElement + "\"" + arrElem[k].replace(arrElem[k].substring(0, count), maskingStr) + "\"";
	                                                    maskingStr = '';
	                                                    if (k != arrElem.length - 1) {
	                                                        maskedElement = maskedElement + ",";
	                                                    }
	                                                }
	                                                maskedElement = maskedElement + "]";
	                                                //Replace the masked String in the parent json
	                                                strJSON = strJSON.replace(arrMatch[j], "\"" + tagToMask + "\": " + maskedElement);
	                                            }
	                                        }
	                                    }
	                                }
	                            }
	                        } else {
	                            //Element to be masked is a single object
	                            var txtcount = tagMatch[i].split("\"").length - 1;
	                            if (txtcount == 4) {
	                                //Element is a String
	                                var elementToMask = tagMatch[i].substring(tagMatch[i].indexOf(":") + 1);

	                                var count = 1;
	                                if (elementToMask.length > keepLastChars) {
	                                    count = elementToMask.length - keepLastChars - 2;
	                                }

	                                for (var a = 0; a < count - 1; a++) {
	                                    if (!maskingStr) {
	                                        //maskingStr = '*';
	                                        maskingStr = maskChar;
	                                    } else {
	                                        //maskingStr = maskingStr + '*';
	                                        maskingStr = maskingStr + maskChar;
	                                    }
	                                }

	                                var maskedElement = elementToMask.replace(elementToMask.substring(0, count), maskingStr);
	                                maskingStr = '';
	                                maskedElement = maskedElement.substring(0, maskedElement.length - 1) + elementToMask.substring(elementToMask.length - 1);
	                                strJSON = strJSON.replace(tagMatch[i], "\"" + tagToMask + "\": \"" + maskedElement);
	                            } else {
	                                //Element is an Integer
	                                var elementToMask = tagMatch[i].substring(tagMatch[i].indexOf(":") + 1);
	                                var count = 1;
	                                if (elementToMask.length > keepLastChars) {
	                                    count = elementToMask.length - keepLastChars - 1;
	                                }
	                                for (var a = 0; a < count; a++) {
	                                    if (!maskingStr) {
	                                        //maskingStr = '*';
	                                        maskingStr = maskChar;
	                                    } else {
	                                        //maskingStr = maskingStr + '*';
	                                        maskingStr = maskingStr + maskChar;
	                                    }
	                                }

	                                var maskedElement = elementToMask.replace(elementToMask.substring(0, count), maskingStr);
	                                maskingStr = '';
	                                maskedElement = maskedElement.substring(0, maskedElement.length - 1) + '\"' + elementToMask.substring(elementToMask.length - 1);
	                                //Replace the masked String in the parent json
	                                strJSON = strJSON.replace(tagMatch[i], "\"" + tagToMask + "\": \"" + maskedElement);
	                            }
	                        }
	                    }
	                }
	            }

	            var attrRegExPatternJSON = '"@' + tagToMask + '":"' + '(.*?)' + '"';
	            tagMatch = strJSON.match(new RegExp(attrRegExPatternJSON, 'g'));
	            if (tagMatch) {
	                for (var i = 0; i < tagMatch.length; i++) {
	                    var attrElem = tagMatch[i].split("\"");
	                    var elementToMask = attrElem[3];
	                    var count = 1;
	                    if (elementToMask.length > keepLastChars) {
	                        count = elementToMask.length - keepLastChars;
	                    }
	                    for (var a = 0; a < count; a++) {
	                        if (!maskingStr) {
	                            //maskingStr = '*';
	                            maskingStr = maskChar;
	                        } else {
	                            //maskingStr = maskingStr + '*';
	                            maskingStr = maskingStr + maskChar;
	                        }
	                    }

	                    var maskedElement = elementToMask.replace(elementToMask.substring(0, count), maskingStr);
	                    maskingStr = '';
	                    strJSON = strJSON.replace(tagMatch[i], "\"@" + tagToMask + "\":\"" + maskedElement + "\"");

	                }
	            }
	        }
	    }

	    return strJSON;
	}
var apiMaskData = function(str, maskConfig) {
	str=str.replace(/[\n\r]/g,"");
	str=str.trim();
	//str=str.replace(/(<(pre|script|style|textarea)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g, "$1$3");
	if (str.startsWith("{")){
        return js_maskJSONData(str,maskConfig);
    }
    if (str.startsWith("<")){
        return js_maskXMLData(str,maskConfig);
    }
    return str;
}

//To mask the query parameter values from URL
var maskQueryParams = function(str){
    str=str.replace(/[\n\r]/g,"");
	str=str.trim();
	var res=str.split("?");
	var resQueryParams= "";
	if(res.length > 1){
	    var queryParamsString = res[1];
	    if(queryParamsString != ""){
    	    var queryParams = queryParamsString.split("&");
    	    if(queryParams.length > 0){
    	        resQueryParams= "";
    	        queryParams.forEach(function(queryParamString){
    	           var queryParam = queryParamString.split("=");
    	           queryParamString=queryParam[0]+"="+"****";
    	           /*if(queryParam[0] == queryMaskConfig){
    	               //queryParamString=queryParam[0]+"="+queryParam[1].replace(/[a-zA-Z0-9%]/g,"*");
    	               queryParamString=queryParam[0]+"="+"****";
    	           }*/
    	           if(resQueryParams !== ""){
    	               resQueryParams=resQueryParams+"&"+queryParamString;
    	           }else{
    	               resQueryParams=queryParamString;
    	           }
    	        });
    	    }
	    }
	    if(resQueryParams !== ""){
	        str = res[0]+"?"+resQueryParams;
	    }
	}
	return str;
}
---
