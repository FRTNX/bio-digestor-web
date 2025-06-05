const BASE_URL = 'https://bio-digestor-sim.onrender.com';
// const BASE_URL = 'http://localhost:8002';

const initEnv = async () => {
    try {
        const response = await fetch(`${BASE_URL}/bd/init`, {
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
};

const tick = async (envId) => {
    try {
        const response = await fetch(`${BASE_URL}/bd/tick?environment_id=${envId}`, {
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
    initEnv,
    tick
};
