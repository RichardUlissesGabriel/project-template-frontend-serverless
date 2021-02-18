'use strict'

class ResourceManipulate {
  constructor(serverless, options) {
    this.initialized = false;
    this.serverless = serverless;
    this.options = options;
    this.naming = this.serverless.providers.aws.naming;

    this.hooks = {
      'after:package:setupProviderConfiguration': this.setupProviderConfiguration.bind(this),
    };
  }

  //LOGS
  //this.serverless.cli.log(JSON.stringify(apiGateway))
  //throw new Error(JSON.stringify(this.api))

  initializeVariables() {
    if (!this.initialized) {
      const awsCreds = Object.assign({}, this.serverless.providers.aws.getCredentials(), { region: this.serverless.service.provider.region })
      this.route53 = new this.serverless.providers.aws.sdk.Route53(awsCreds)
      this.acm = new this.serverless.providers.aws.sdk.ACM(awsCreds)

      this.initialized = true
    }
  }

  async setupProviderConfiguration(){
    this.initializeVariables()
    await this.manipulateRoute53RecordSets()
    await this.manipulateCerticate()
    await this.manipulateRouteCloudFrontDistribution()

    const urlSite = this.serverless.service.provider.urlSite.replace('prod.', '')

    // creating a checking function to create Rout53 DNS to validate certificate
    async function _createDomainValidation() {
      const { CertificateSummaryList } = await this.acm.listCertificates().promise()
      const certificateArn = CertificateSummaryList.filter(cert => cert.DomainName === urlSite)
      if(certificateArn.length > 0){
        const { Certificate } = await this.acm.describeCertificate({CertificateArn: certificateArn[0].CertificateArn}).promise()
        if(Certificate.Status === 'PENDING_VALIDATION'){
          let resourceRecords = []

          for(const domainValidation of Certificate.DomainValidationOptions){
            // we don't have all information yet
            if(!domainValidation.ResourceRecord){
              setTimeout(() => this.createDomainValidation(), 5000)
              return
            }
            resourceRecords.push(domainValidation.ResourceRecord)
          }
          // Remove duplicates
          resourceRecords = [...new Map(resourceRecords.map(item => [item['Name'], item])).values()]
          for(const resourceRecord of resourceRecords){
            await this.route53.changeResourceRecordSets({
              ChangeBatch: {
                Changes: [
                  {
                    Action: 'CREATE',
                    ResourceRecordSet: {
                      Name: resourceRecord.Name,
                      Type: resourceRecord.Type,
                      ResourceRecords: [{
                        Value: resourceRecord.Value
                      }],
                      TTL: 300
                    },
                  }
                ]
              },
              HostedZoneId: this.hostedZoneId
            }).promise()
          }
        }
      } else {
        // every 5 seconds try again
        setTimeout(() => this.createDomainValidation(), 5000)
      }
    }
    this.createDomainValidation = _createDomainValidation.bind(this)
    this.createDomainValidation()

  }

  async manipulateRoute53RecordSets(){

    const resources = this.serverless.service.resources.Resources
    const stage = this.serverless.service.provider.stage

    const recordSets = Object.keys(resources).reduce((arr, key) => {
      if (resources[key].Type === 'AWS::Route53::RecordSet') {
        arr.push(resources[key])
      }
      return arr
    }, [])

    for(const record of recordSets){
      const domainName = record.Properties.DomainName
      // Removo ele do meu objeto pois não utilizarei ele mais
      delete record.Properties.DomainName

      // removing if was in production env
      if(stage === 'prod'){
        record.Properties.Name = record.Properties.Name.replace('prod.', '')
      }

      const { HostedZones } = await this.route53.listHostedZones({}).promise()
      const hostedZone = HostedZones.filter((hz) => (hz.Name.endsWith('.') ? hz.Name.slice(0, -1) : hz.Name) === domainName)

      // Não existe route53 para esse domínio
      if(hostedZone.length === 0){
        throw new Error(`Error: Não existe hosted zone para o domínio ${domainName} registrado no serviço Route53`)
      }
      //const hostedZoneId = hostedZone.Id.split('')

      for (let i = 0; i < hostedZone.length; ++i){

        const startPos = hostedZone[i].Id.indexOf('e/') + 2
        const endPos = hostedZone[i].Id.length
        const hostedZoneId = hostedZone[i].Id.substring(startPos, endPos)

        // Preciso criar outro resource no cloudformation
        if(i > 0){
          const newRecordSet = {
            [`Route53RecordSet${record.Properties.Type}${i}`]: {
              Type: 'AWS::Route53::RecordSet',
              DependsOn: 'Distribution',
              Properties: {
                Name: record.Properties.Name,
                Type: record.Properties.Type,
                HostedZoneId: hostedZoneId,
                AliasTarget: {
                  DNSName: { 'Fn::GetAtt':  [ 'Distribution', 'DomainName' ] },
                  EvaluateTargetHealth: false,
                  HostedZoneId: 'Z2FDTNDATAQYW2'
                }
              }
            }
          }
          Object.assign(resources, newRecordSet)
        }else{
          record.Properties.HostedZoneId = hostedZoneId
        }
      }
    }
  }

  async manipulateCerticate(){

    const resources = this.serverless.service.resources.Resources
    const stage = this.serverless.service.provider.stage

    const certificates = Object.keys(resources).reduce((arr, key) => {
      if (resources[key].Type === 'AWS::CertificateManager::Certificate') {
        arr.push(resources[key])
      }
      return arr
    }, [])

    for (const certificate of certificates){
      const domainValidation = certificate.Properties.DomainValidationOptions[0]
      const domainName = domainValidation.DomainName

      if(stage === 'prod'){
        certificate.Properties.DomainName = certificate.Properties.DomainName.replace('prod.', '')
        const subjectAlternativeNames = certificate.Properties.SubjectAlternativeNames
        certificate.Properties.SubjectAlternativeNames = []
        for (const alternativeName of subjectAlternativeNames){
          certificate.Properties.SubjectAlternativeNames.push(alternativeName.replace('prod.', ''))
        }
      }

      const { HostedZones } = await this.route53.listHostedZones({}).promise()
      const hostedZone = HostedZones.filter((hz) => (hz.Name.endsWith('.') ? hz.Name.slice(0, -1) : hz.Name) === domainName && hz.Config.PrivateZone === false)

      // Não existe route53 para esse domínio
      if(hostedZone.length === 0){
        throw new Error(`Error: Não existe hosted zone para o domínio ${domainName} registrado no serviço Route53`)
      }

      const startPos = hostedZone[0].Id.indexOf('e/') + 2
      const endPos = hostedZone[0].Id.length
      const hostedZoneId = hostedZone[0].Id.substring(startPos, endPos)

      domainValidation.HostedZoneId = hostedZoneId
      this.hostedZoneId = hostedZoneId
    }
  }

  async manipulateRouteCloudFrontDistribution(){

    const resources = this.serverless.service.resources.Resources
    const stage = this.serverless.service.provider.stage

    const cloudFronts = Object.keys(resources).reduce((arr, key) => {
      if (resources[key].Type === 'AWS::CloudFront::Distribution') {
        arr.push(resources[key])
      }
      return arr
    }, [])

    for(const cloudFront of cloudFronts){
      const distributionConfig = cloudFront.Properties.DistributionConfig

      // removing if was in production env
      if(stage === 'prod'){
        for (let alias of distributionConfig.Aliases){
          alias = alias.replace('prod.', '')
        }

        const aliases = distributionConfig.Aliases
        distributionConfig.Aliases = []
        for (const alias of aliases){
          distributionConfig.Aliases.push(alias.replace('prod.', ''))
        }
      }
    }
  }
}

module.exports = ResourceManipulate
