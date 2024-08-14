// Import required libraries
const hubspot = require('@hubspot/api-client');
const axios = require('axios');
const request = require('request');

exports.main = (event, callback) => {

	const hubspotClient = new hubspot.Client({
		apiKey: process.env.HAPIKEY
	});

	let companydb = 'A90362_COMPANYNAMEHERE';
	let Bodyc;
	
	Bodyc = {
		"CompanyDB": companydb,
		"UserName": "CLOUDIAX\\f50313.9",
		"Password": process.env.passsap
	};

	const headers = {
		'Content-Type': 'application/json'
	};

	axios.post('https://sv-ger-hana729b.cloudiax.com:50000/b1s/v1/Login',
		Bodyc,
		{headers})
	.then(response => {

		var cookiesesion = response.data.SessionId;
		//console.log(response.data.SessionId);

		hubspotClient.crm.companies.basicApi.getById(event.object.objectId, ["codigo_sap"]).then(results => {

			let codigo_sap = results.body.properties.codigo_sap;
			let codigocookiegenerado = "B1SESSION="+cookiesesion+"; ROUTEID=.node0";


			var options = {
				"method": "GET",
				"url": "https://sv-ger-hana729b.cloudiax.com:50000/b1s/v1/BusinessPartners('"+codigo_sap+"')?$select=CardCode,CardName,CurrentAccountBalance",
				"headers": {
					"Cookie": codigocookiegenerado
				}
			};
			request(options, function (error, response2, body2) {

				var saldo_salida = JSON.parse(body2).CurrentAccountBalance;

				hubspotClient.crm.companies.basicApi.update(event.object.objectId, 
				{ 
					"properties": 
					{ 
						"saldo_de_cuenta": saldo_salida
					}
				});
				console.log(saldo_salida);
			});
		});
	});
}