<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<MessageLogging async="false" continueOnError="false" enabled="true" name="ML-CommonLogAPIMetadata">
    <DisplayName>ML-CommonLogAPIMetadata</DisplayName>
    <Syslog>
        <Message>{api.logMessage}</Message>
        <Host>internal.sunsuper.com.au</Host>
        <Port>8086</Port>
        <Protocol>TCP</Protocol>
        <SSLInfo>
            <Enabled>true</Enabled>
            <ClientAuthEnabled>true</ClientAuthEnabled>
            <KeyStore>ref://splunkKeystoreEdgeSunSuperClientKeyRef</KeyStore>
            <KeyAlias>splunk-key</KeyAlias>
            <!--<TrustStore>ref://chTrustRefTest</TrustStore>-->
        </SSLInfo>
    </Syslog>
</MessageLogging>
