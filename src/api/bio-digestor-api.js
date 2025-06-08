const BASE_URL = 'https://bio-digestor-sim.onrender.com';
// const BASE_URL = 'http://localhost:8002';

const runSimulation = async (params) => {
    try {
        const response = await fetch(`${BASE_URL}/bd/init`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        return await response.json()
    } catch (error) {
        console.log(error);
    }
};

const ping = async () => {
    try {
        const response = await fetch(`${BASE_URL}/bd/ping`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json()
    } catch (error) {
        console.log(error);
    }
}


export {
    runSimulation,
    ping
};
