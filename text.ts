<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<AssignMessage async="false" continueOnError="false" enabled="true" name="AM-CaptureTargetRequestDetails">
    <DisplayName>AM-CaptureTargetRequestDetails</DisplayName>
    <AssignVariable>
        <Name>private.api.targetRequestContent</Name>
        <Ref>request.content</Ref>
    </AssignVariable>
    <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
    <AssignTo createNew="false" transport="http" type="request"/>
</AssignMessage>

	----

	<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SharedFlow name="default">
    <Step>
        <Name>AM-CaptureTargetRequestDetails</Name>
    </Step>
</SharedFlow>
