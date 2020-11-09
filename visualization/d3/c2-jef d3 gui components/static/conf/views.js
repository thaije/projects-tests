var viewConfig = {
    "views": [
        {
            "name": "Rise of fear for safety",
            "description": "<div id='vv_description'><h1>Rise of fear for safety</h1><hr><img class='related_indepth_views' src='/static/images/sidepanel_verdiepende_view_rise_of_fear_for_safety.png'><p>The Rise of Fear for Safety is a complex interaction amongst the societal and military forces. RUS and NATO have both increased their military presence and capabilities near LIT. The sense of security and trust in LIT government has been low. No LIT military capabilities have been seen to be active, except for a LIT engineer platoon that is restoring the cyber infrastructure after the powerplant failure. The powerplant failure has caused fear over loss of control of the important railroad over Vievis, connecting Kaunas and Vilnius. Moreover, a lot of farmland has been destroyed and some farmers claim they have seen RUS looking vehicles driving through vulnerable crops, although no RUS infiltration has been confirmed by the government. The authorities have done nothing for protection and restoration of the farmland. At the same time RUS is airing a media campaign defaming LIT government and promoting RUS energy, which gets a lot of attention amongst the pro-RUS part of society. The mayor of Vievis has requested the international community to assist, but LIT government activity is not perceived by the local population. The perceived safety and security is low, also due to other reasons, and the interaction between these elements causes the Rise of Fear for Safety.</p>Author<br>Last updated: 4 april 2020</div>",
            "knowledge": `?object rdf:type ont:Loop .
					?object rdfs:label ?name .
					VALUES ?name { "Rise of fear for safety" }`,
            "KGCGoldenLayout":
                {
                    "type": "row",
                    "content":
                    [
                    	 {
                            "type": "column",
                            "width": 57,
                            "content":
                            [
                                {
		                            "type": "component",
		                            "componentName": "map",
                                    "height": 60,
		                            "title": "Incidents safety and security",
		                            "componentState": {
		                                "knowledge":
		                                		`?org rdf:type ?typeId .
												  ?typeId rdfs:subClassOf v1905:SafetyEvent .
												  ?typeId rdfs:label ?type .
												  ?org rdfs:label ?name .
												  ?org ont:Description ?desc .
												  ?org ont:Date ?date .
												  ?org ont:Time ?time .
												  ?org ont:Latitude ?lat .
												  ?org ont:Longitude ?lon .`,
		                                "transformation": 
		                                	`{
											    "map_label": "Military threat events",
											    "map_center": [54.939421, 26.0281669],
											    "default_zoom": 6,
											    "markers": [results.bindings.{"name": name.value, "type": type.value, "description": desc.value, "date": date.value, "time": time.value, "latitude": $number($replace(lat.value, ",", ".")), "longitude": $number($replace(lon.value, ",", "."))}]
											}`,
		                                "label": "v1areamap"
		                            }
		                        },
                                {
                                    "type": "component",
                                    "componentName": "linechart",
                                    "title": "Incidents safety and security",
                                    "componentState": {
                                        "knowledge": `?org rdf:type ?typeId .
												  ?typeId rdfs:subClassOf v1905:SafetyEvent .
												  ?typeId rdfs:label ?type .
												  ?org rdfs:label ?name .
												  ?org ont:Description ?desc .
												  ?org ont:Date ?date .
												  ?org ont:Time ?time .
												  ?org ont:Latitude ?lat .
												  ?org ont:Longitude ?lon .`,
                                        "transformation": `{   
										    "legend_label": "Security Incidents",
										    "data": [
										        results.bindings^(date.value).{
										            
										            "date": $d := date.value,
										            $t := type.value: $count($filter($$.results.bindings, function($v, $i, $a){$v.date.value = $d and $v.type.value = $t}).time.value)
										        }
										    ]
										}`,
                                        "label": "v1linechart"
                                    }
                                }
                            ]
                        },
                        {
                            "type": "column",
                            "content":
                            [
                                {
                                    "type": "component",
                                    "componentName": "barchart",
                                    "title": "Trust in LIT government",
                                    "height": 30,
                                    "componentState": {
                                        "knowledge": `?org rdf:type ont:GroupCharacteristicValueDistribution .
										  ?org ont:1stDimension ?1stDim .
										  ?1stDim rdfs:label "Nationality_Lit" .
										  ?org ont:2ndDimension ?2ndDim .
										  ?2ndDim rdfs:label "NatGov_Sentiment_Percentage" .
										  ?org ont:TimePeriod ?date .
										  ?org ont:ActualValue ?perc .
										  FILTER(?date >= "2020-02-01"^^xsd:date && ?date <= "2020-03-07"^^xsd:date) .`,
										"transformation": `{"legend_label": "Goverment sentiment","data": [results.bindings^(<date.value).{"category": date.value, "value":  $number($replace(perc.value, ",", "."))}]}`,
                                        "label": "v1barchart"
                                    }
                                },
                                {
                                    "type": "component",
                                    "componentName": "barchart",
                                    "title": "Trust in LIT military capacity",
                                    "height": 30,
                                    "componentState": {
                                        "knowledge": `?org rdf:type ont:GroupCharacteristicValueDistribution .
										  ?org ont:1stDimension ?1stDim .
										  ?1stDim rdfs:label "Nationality_Lit" .
										  ?org ont:2ndDimension ?2ndDim .
										  ?2ndDim rdfs:label "MilCap_Sentiment_Percentage" .
										  ?org ont:TimePeriod ?date .
										  ?org ont:ActualValue ?perc .
										  FILTER(?date >= "2020-02-01"^^xsd:date && ?date <= "2020-03-07"^^xsd:date) .`,
										"transformation": `{"legend_label": "Military Capacity sentiment","data": [results.bindings^(<date.value).{"category": date.value, "value":  $number($replace(perc.value, ",", "."))}]}`,
                                        "label": "v1barchart"
                                    }
                                },
                                {
                                    "type": "component",
                                    "componentName": "twitter",
                                    "title": "Newsfeed",
                                    "componentState": {
                                        "knowledge": `?info a ont:InfoChannel ;
													rdfs:label           "Twitter" ;
													ont:hasSubject		"Fear for security";
													ont:hasAccount       ?account .`,
                                        "transformation": `{ "account":results.bindings.account.value }`,
                                        "label": "v1piechart"
                                    }
                                }
                            ]
                        }
                    ]
                }
        },
        {
            "name": "Fear inducing news of RUS military activity",
            "description": "<div id='vv_description'><h1>Fear inducing news of RUS military activity</h1><hr><img class='related_indepth_views' src='/static/images/sidepanel_verdiepende_view_fear_inducing_news_of_loss_of_RUS_military_activity.png'><p>There are several media capabilities present in Lithuania. Part of the media capabilities in LIT contribute to the eFP NetForce, others are either ‘neutral’ or supportive to RUS STRATCOM. All communication goes through a 4G network, there are no land lines. An estimated 85% of the population currently monitor the RUS media, mainly people of 50 years and older. RUS is also suspected of influencing LIT media. RUS is allegedly already influencing LIT citizens via (social) media and cyber-attacks like the recent attack on the power plant. Some news sources speculate RUS infiltrators might have poisoned the population, others suggest it’s a kind of measles.</p>Author<br>Last updated: 4 april 2020</div>",
            "knowledge": `?object rdf:type ont:Factor .
					?object rdfs:label "Fear inducing news of RUS military activity" .`,
            "KGCGoldenLayout":
            {
                "type": "row",
                "width": 56,
                "content":
                [
                    {
                        "type": "column",
                        "content":
                        [
                            {
                                "type": "component",
                                "componentName": "html",
                                "height": 65,
                                "title": "Media influence",
                                "componentState": {
                                    "html": "<div class='still_container'><img src='/static/images/verdiepende_view_fear_inducing_news_of_RUS_military_activity_top.png' /></div>"
                                }
                            },
                            {
                                "type": "component",
                                "componentName": "html",
                                "height": 30,
                                "title": "Media trending topics",
                                "componentState": {
                                    "html": "<div class='still_container'><img src='/static/images/verdiepende_view_fear_inducing_news_of_RUS_military_activity_bottom.png' /></div>"
                                }
                            }
                        ]
                    }
                ]
            }
        },
        {
            "name": "Rise of fear for diminishing standard of living",
            "description": "<div id='vv_description'><h1>Rise of fear for diminishing standard of living</h1><hr><img class='related_indepth_views' src='/static/images/sidepanel_verdiepende_view_rise_of_fear_for_diminishing_standard_of_living.png'><p>The recent energy failures, incidents with farmland and transportation, and the lack of effective social security services give rise to fear for diminishing standard of living. The actual number of incidents with essential services remains lower than during the beginning of February, however the government sentiment and the sentiment to essential services have only declined since then. This could be due to the other forces at play: a rise of fear for safety, fear inducing news of RUS military activity, and of loss of essential services, all relating to a lesser perceived safety and security. RUS supplies most of the populations communication services, and any anticipated incidents there results in a strong decrease in the standard of living.</p>Author<br>Last updated: 4 april 2020</div>",
            "knowledge": `?object rdf:type ont:Loop .
					?object rdfs:label "Rise of fear for diminishing standard of living" .`,
            "KGCGoldenLayout":
                {
                    "type": "row",
                    "content":
                    [
                    	 {
                            "type": "column",
                            "width": 56,
                            "content":
                            [
                                {
		                            "type": "component",
		                            "componentName": "map",
		                            "height": 60,
		                            "title": "Incidents Essential Services",
		                            "componentState": {
		                                "knowledge":
		                                		`?org rdf:type ?typeId .
												  ?typeId rdfs:subClassOf ?itemType .
												  ?typeId rdfs:label ?type .
												  ?org rdfs:label ?name .
												  OPTIONAL { 
												    ?org ont:Date ?date .
												    ?org ont:Time ?time .
												  }
												  ?org ont:Latitude ?lat .
												  ?org ont:Longitude ?lon .
												  VALUES (?itemType) {(v1905:EnergyEvent) (v1905:Structure)}`,
		                                "transformation": 
		                                	`{
											    "map_label": "Essential services events",
											    "map_center": [54.939421, 26.0281669],
											    "default_zoom": 6,
											    "markers": [results.bindings.{"name": name.value, "type": type.value, "description": desc.value, "date": date.value, "time": time.value, "latitude": $number($replace(lat.value, ",", ".")), "longitude": $number($replace(lon.value, ",", "."))}]
											}`,
		                                "label": "v1areamap"
		                            }
		                        },
                                {
                                    "type": "component",
                                    "componentName": "linechart",
                                    "title": "Incidents essential services",
                                    "componentState": {
                                        "knowledge": `?org rdf:type ?typeId .
												  ?typeId rdfs:subClassOf v1905:EnergyEvent .
												  ?typeId rdfs:label ?type .
												  ?org rdfs:label ?name .
												  ?org ont:Date ?date .
												  ?org ont:Time ?time .
												  ?org ont:Latitude ?lat .
												  ?org ont:Longitude ?lon .`,
                                        "transformation": `{   
										    "legend_label": "Incidents essential services",
										    "data": [
										        results.bindings^(date.value).{
										            
										            "date": $d := date.value,
										            $t := type.value: $count($filter($$.results.bindings, function($v, $i, $a){$v.date.value = $d and $v.type.value = $t}).time.value)
										        }
										    ]
										}`,
                                        "label": "v1linechart"
                                    }
                                }
                            ]
                        },
                        {
                            "type": "column",
                            "content":
                            [
                                {
                                    "type": "component",
                                    "componentName": "barchart",
                                    "title": "Trust in LIT government",
                                    "height": 30,
                                    "componentState": {
                                        "knowledge": `?org rdf:type ont:GroupCharacteristicValueDistribution .
										  ?org ont:1stDimension ?1stDim .
										  ?1stDim rdfs:label "Nationality_Lit" .
										  ?org ont:2ndDimension ?2ndDim .
										  ?2ndDim rdfs:label "NatGov_Sentiment_Percentage" .
										  ?org ont:TimePeriod ?date .
										  ?org ont:ActualValue ?perc .
										  FILTER(?date >= "2020-02-01"^^xsd:date && ?date <= "2020-03-07"^^xsd:date) .`,
										"transformation": `{"legend_label": "Goverment sentiment","data": [results.bindings^(<date.value).{"category": date.value, "value":  $number($replace(perc.value, ",", "."))}]}`,
                                        "label": "v1barchart"
                                    }
                                },
                                {
                                    "type": "component",
                                    "componentName": "barchart",
                                    "title": "Trust in LIT delivery of essential services",
                                    "height": 30,
                                    "componentState": {
                                        "knowledge": `?org rdf:type ont:GroupCharacteristicValueDistribution .
										  ?org ont:1stDimension ?1stDim .
										  ?1stDim rdfs:label "Nationality_Lit" .
										  ?org ont:2ndDimension ?2ndDim .
										  ?2ndDim rdfs:label "EssentialServices_Sentiment_Percentage" .
										  ?org ont:TimePeriod ?date .
										  ?org ont:ActualValue ?perc .
										  FILTER(?date >= "2020-02-01"^^xsd:date && ?date <= "2020-03-07"^^xsd:date) .`,
										"transformation": `{"legend_label": "Essential services sentiment","data": [results.bindings^(<date.value).{"category": date.value, "value":  $number($replace(perc.value, ",", "."))}]}`,
                                        "label": "v1barchart"
                                    }
                                },
                                {
                                    "type": "component",
                                    "componentName": "twitter",
                                    "title": "Newsfeed",
                                    "componentState": {
                                        "knowledge": `?info a ont:InfoChannel ;
													rdfs:label           "Twitter" ;
													ont:hasSubject		"Loss of essential services";
													ont:hasAccount       ?account .`,
                                        "transformation": `{ "account":results.bindings.account.value }`,
                                        "label": "v1piechart"
                                    }
                                }
                            ]
                        }
                    ]
                }
        },
        {
            "name": "Fear inducing news of loss of essential services",
            "description": "<div id='vv_description'><h1>Fear inducing news of loss of essential services</h1><hr><img class='related_indepth_views' src='/static/images/sidepanel_verdiepende_view_rear_inducing_news_of_loss_of_essential_services.png'><p>The Vievis powerplant is key in the infrastructure to distribute the electrical power imported from SWE. Recently an incident at this power plant caused an extensive power cut with national consequences. For a week, power could not be guaranteed in large parts of LIT, resulting in numerous small scale power cuts, especially in the rural areas where most of the population is ethnic RUS. These power cuts have also affected the effectiveness of the security apparatus. SWE IT specialists were called in to diagnose the cause of the power cut and they concluded that a cyber-attack could well be the cause. The SWE IT specialists are currently solving the problem and a LIT engineer platoon is restoring the cyber infrastructure. RUS energy companies are airing a media campaign promoting RUS energy for LIT households.</p>Author<br>Last updated: 4 april 2020</div>",
            "knowledge": `?object rdf:type ont:Factor .
					?object rdfs:label "Fear inducing news of loss of essential services" .`,
            "KGCGoldenLayout":
            {
        		"type": "row",
        		"width": 56,
                "content":
                [
                    {
                        "type": "column",
                        "content":
                        [
                            {
                                "type": "component",
                                "componentName": "html",
                                "height": 65,
                                "title": "Media influence",
                                "componentState": {
                                    "html": "<div class='still_container'><img src='/static/images/verdiepende_view_fear_inducing_news_of_loss_of_essential_services_top.png' /></div>"
                                }
                            },
                            {
                                "type": "component",
                                "componentName": "html",
                                "height": 30,
                                "title": "Media trending topics",
                                "componentState": {
                                    "html": "<div class='still_container'><img src='/static/images/verdiepende_view_fear_inducing_news_of_loss_of_essential_services_bottom.png' /></div>"
                                }
                            }
                        ]
                    }
                ]
            }
        },
        {
            "name": "Perceived safety and security",
            "description": "<div id='vv_description'><h1>Perceived safety and security</h1><hr><img class='related_indepth_views' src='/static/images/sidepanel_verdiepende_view_perceived_safety_and_security.png'><p>Perceived Safety and Security is a resilience capital factor, causing popular unrest. The Rise of Fear for Safety causes the trust in LIT government, the government capacity and the sense of security to spiral downwards. Next to the Rise of Fear for Safety the livelihood and economic safety is at stake. There is an unemployment rate of 12.1 % and a lack of social security services, which stands in relation with an excessive abuse of alcohol and the highest suicide rate in the EU. Next to a lack of social security services, there is a fear for the lack of energy due to recent power cut. Moreover, with the fear for RUS infiltration there comes a fear of RUS control of the 4G network which is mainly from RUS suppliers, and since there are no landlines virtually all communication relies on this. Energy and banking services are mostly provided by Sweden, but RUS seeks a stake of the energy market in conjunction with power outages. The social cohesion between ethnic groups has been low, but recent inactivity of LIT authorities and RUS media campaign promoting RUS sentiments has further troubled the social cohesion and reduces the perceived safety and security.</p>Author<br>Last updated: 4 april 2020</div>",
            "knowledge": `?object rdf:type ont:Factor .
					?object rdfs:label "Perceived safety and security" .`,
            "KGCGoldenLayout":
            {
        		"type": "row",
        		"width": 56,
                "content":
                [
                	{
                        "type": "component",
                        "componentName": "html",
                        "title": "Perceived safety and security",
                        "componentState": {
                        	"html": "<div class='still_container'><img src='/static/images/verdiepende_view_perceived_safety_and_security_edited.png' /></div>"
                        }
                    }
                ]
            }
        }
    ]
};
