<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SharedFlow name="default">
    <Step>
        <Name>AM-CaptureRequestDetails</Name>
    </Step>
    <Step>
        <Name>KVM-FetchApiLogConfig</Name>
    </Step>
    <Step>
        <Name>KVM-FetchDefaultLogConfig</Name>
        <Condition>(api.sf.kvm.logConfig equals "") or (api.sf.kvm.logConfig equals null)</Condition>
    </Step>
    <Step>
        <Name>EV-SetLogVariables</Name>
    </Step>
</SharedFlow>

----

    
