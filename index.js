const fs = require('fs')
const jwt = require('jsonwebtoken')
const express = require('express')
const axios = require('axios')
const qs = require('qs')

const privateKeyName = './privatekey.pem' // Should be valid path to the private key
const issuer = 'sandbox-business.revolut.com' // Issuer for JWT, should be derived from your redirect URL
const client_id = 'uWToylkgaiB7mMNP5q1Ir6DqIFRVHJpOqprzdDdATAI' // Your client ID
const aud = 'https://revolut.com' // Constant
const payload = {
    "iss": issuer,
    "sub": client_id,
    "aud": aud
}
const privateKey = fs.readFileSync(privateKeyName);
const token = jwt.sign(payload, privateKey, {algorithm: 'RS256', expiresIn: 60 * 60});

const app = express()

async function getAuthToken() {
    const body = {
        grant_type: 'authorization_code',
        code: 'oa_sand_gg-_wDV66wYfKKpnF4RIrpOZs2oPTwNp4TXOra5pS0g',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token,
        client_id
    }

    const {data: {access_token}} = await axios.post('https://sandbox-b2b.revolut.com/api/1.0/auth/token', qs.stringify(body), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    return access_token;
}

app.get('/', async (request, response) => {
    try {
        const token = await getAuthToken();

        console.log(token)

        const {data: accounts} = await axios.get('https://sandbox-b2b.revolut.com/api/1.0/accounts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        response.json(accounts);
    } catch (e) {
        response.status(500).json(e)
    }
})

app.listen(3000, () => {
    console.log('Server Started at port : 3000')
})