<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<AssignMessage async="false" continueOnError="false" enabled="true" name="AM-CaptureTargetResponseDetails">
    <DisplayName>AM-CaptureTargetResponseDetails</DisplayName>
    <AssignVariable>
        <Name>private.api.targetResponseContent</Name>
        <Ref>message.content</Ref>
    </AssignVariable>
    <AssignVariable>
        <Name>private.api.targetResponseReasonPhrase</Name>
        <Ref>message.reason.phrase</Ref>
    </AssignVariable>
    <AssignVariable>
        <Name>private.api.targetResponseStatusCode</Name>
        <Ref>message.status.code</Ref>
    </AssignVariable>
    <AssignVariable>
        <Name>private.api.targetRequestUrl</Name>
        <Ref>request.url</Ref>
    </AssignVariable>
    <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
    <AssignTo createNew="false" transport="http" type="response"/>
</AssignMessage>

	----
	<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SharedFlow name="default">
    <Step>
        <Name>AM-CaptureTargetResponseDetails</Name>
    </Step>
</SharedFlow>
