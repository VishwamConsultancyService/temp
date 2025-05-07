<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ExtractVariables async="false" continueOnError="false" enabled="true" name="EV-SetLogVariables">
    <DisplayName>EV-SetLogVariables</DisplayName>
    <Properties/>
    <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
    <JSONPayload>
        <Variable name="api.logLevel">
            <JSONPath>$.logLevel</JSONPath>
        </Variable>
        <Variable name="api.maskLog">
            <JSONPath>$.dataMask.mask</JSONPath>
        </Variable>
        <Variable name="api.maskConfig">
            <JSONPath>$.dataMask.maskConfig</JSONPath>
        </Variable>
    </JSONPayload>
    <Source clearPayload="false">api.sf.kvm.logConfig</Source>
</ExtractVariables>

-----

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<KeyValueMapOperations async="false" continueOnError="false" enabled="true" name="KVM-FetchApiLogConfig" mapIdentifier="LoggingConfig">
    <DisplayName>KVM-FetchApiLogConfig</DisplayName>
    <Properties/>
    <ExclusiveCache>false</ExclusiveCache>
    <ExpiryTimeInSecs>5</ExpiryTimeInSecs>
    <Get assignTo="api.sf.kvm.logConfig">
        <Key>
            <Parameter ref="apiproxy.name"/>
        </Key>
    </Get>
    <Scope>environment</Scope>
</KeyValueMapOperations>


----


    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<KeyValueMapOperations async="false" continueOnError="false" enabled="true" name="KVM-FetchDefaultLogConfig" mapIdentifier="LoggingConfig">
    <DisplayName>KVM-FetchDefaultLogConfig</DisplayName>
    <Properties/>
    <ExclusiveCache>false</ExclusiveCache>
    <ExpiryTimeInSecs>5</ExpiryTimeInSecs>
    <Get assignTo="api.sf.kvm.logConfig">
        <Key>
            <Parameter>default</Parameter>
        </Key>
    </Get>
    <Scope>environment</Scope>
</KeyValueMapOperations>
