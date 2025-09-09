export class EntityReader {
    constructor(entity, type) {
        this.rawEntity = entity;
        this.detectedStandard = null;
        this.extractedAttributes = {};
        this.type = type;
        this.openidType = null;
        
        // Define the schema detection patterns and attribute mappings
        this.schemaConfigs = {
            SAML: {
                // Detection pattern for SAML
                detect: (entity) => {
                    return entity.hasOwnProperty('title');
                },
                // Attribute extraction mapping for SAML
                extractors: {
                }
            },
            Openid: {
                // Detection pattern for openid
                detect: (entity) => {
                    return entity.hasOwnProperty('entity_types');
                },
                // Attribute extraction mapping for openid
                extractors: {
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.detectedStandard = this.detectStandard();
        if (this.detectedStandard) {
            if (this.detectedStandard === 'Openid') {
                this.openidType = this.type === 'sp' ? 'openid_relaying_party' : 'openid_provider';
                this.schemaConfigs.Openid.extractors = {
                    entityID: (entity) => entity.entity_id,
                    title: (entity) => entity.ui_infos[this.openidType].display_name,
                    title_langs: (entity) => {return {en: entity.ui_infos[this.openidType].display_name}},
                    entity_icon: (entity) => null,
                    entity_icon_url: (entity) => {
                        if (entity.ui_infos[this.openidType].logo_uri) {
                            return {url: entity.ui_infos[this.openidType].logo_uri, width: 100, height: 100}
                        } else return null
                    },
                    domain: (entity) => null,
                    name_tag: (entity) => null,
                    hidden: (entity) => false,
                    hint: (entity) => false,
                    discovery_responses: (entity) => null,
                };
            } else if (this.detectedStandard === 'SAML') {
                this.schemaConfigs.SAML.extractors = {
                    entityID: (entity) => entity.entityID,
                    title: (entity) => entity.title,
                    title_langs: (entity) => entity.title_langs || null,
                    entity_icon: (entity) => entity.entity_icon || null,
                    entity_icon_url: (entity) => entity.entity_icon_url || null,
                    domain: (entity) => entity.domain || null,
                    name_tag: (entity) => entity.name_tag || null,
                    hidden: (entity) => { return entity.hidden === 'true' ? true : false },
                    hint: (entity) => { return entity.hint === 'true' ? true : false },
                    discovery_responses: (entity) => entity.discovery_responses || null,
                };
            }
            this.extractedAttributes = this.extractAttributes();
        } else {
            throw new Error('Unable to detect a valid standard');
        }
    }
    
    detectStandard() {
        for (const [standardName, config] of Object.entries(this.schemaConfigs)) {
            try {
                if (config.detect(this.rawEntity)) {
                    return standardName;
                }
            } catch (error) {
                // Continue checking other standards if detection fails
                continue;
            }
        }
        return null;
    }
    
    extractAttributes() {
        if (!this.detectedStandard) {
            return {};
        }
        
        const config = this.schemaConfigs[this.detectedStandard];
        const extracted = {};
        
        for (const [attributeName, extractor] of Object.entries(config.extractors)) {
            try {
                const extracted_attr = extractor(this.rawEntity);
                extracted[attributeName] = extracted_attr;
            } catch (error) {
                extracted[attributeName] = null;
                console.warn(`Failed to extract attribute '${attributeName}':`, error.message);
            }
        }
        
        return extracted;
    }
    
    getAttribute(name) {
        if (this.extractedAttributes.hasOwnProperty(name)) {
            return this.extractedAttributes[name];
        } else {
            return null;
        }
    }
    
    hasAttribute(name) {
        return this.extractedAttributes.hasOwnProperty(name) && 
               this.extractedAttributes[name] !== null;
    }
}
