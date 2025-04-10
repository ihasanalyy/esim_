import axios from 'axios';

const auth_token = 'Basic Njg3ZmZlNDAtNTU3Yi00OGQxLTg5ZGItMmFiZGNjZjgzOGZmOmJkZTBkZDEyLTk2NGYtNGFhNy04YWNiLTlkMDQ0NjUwM2U3Nw==';


export const getProducts = async (payload) => {
    const response = await axios.get(`https://dvs-api.dtone.com/v1/products?country_iso_code=${payload}`, {
        headers: {
            Authorization: auth_token,
        }
    });
    return response.data;
};

export const getProductsById = async (payload) => {
    const response = await axios.get(`https://dvs-api.dtone.com/v1/products/${payload}`, {
        headers: {
            Authorization: auth_token,
        }
    });
    return response;
};

export const getProductsByCountry = async (payload) => {
    const response = await axios.get(`https://dvs-api.dtone.com/v1/products?service_id=13&country_iso_code=${payload}`, {
        headers: {
            Authorization: auth_token,
        }
    });
    return response;
};


