import fetch from 'isomorphic-fetch';
const url = 'https://www.cs.nctu.edu.tw/csauto/admission_review';
const authUrl = 'https://www.cs.nctu.edu.tw/cscc/cslogin';

function checkStatus(response) {
  if (response.status < 200 || response.status >= 300) {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  } else {
    return response;
  }
}

const WebAPIUtil = {

  postUser: (data) => fetch(`${url}/users`, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }),

  login: (user) => fetch(`${authUrl}/auth/login`, {
    method: 'post',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then(checkStatus)
    .then(res => res.json()),

  login_token: (token) => fetch(`${authUrl}/me?token=${token}`, {
    method: 'get',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(checkStatus)
    .then(res => res.json()),


  logout: (token) => fetch(`${authUrl}/auth/logout?token=${token}`, {
    method: 'get',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(checkStatus)
    .then(res => res.json()),

};

export default WebAPIUtil;
