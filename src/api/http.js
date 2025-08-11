import axios from "./axios.js";
// uploadFile
export function uploadFile(url, data = {}) {
  const loading = this.$loading({
    lock: true,
    text: "加载中，请稍等。。",
  });
  return new Promise(function (resolve, reject) {
    axios
      .post(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(
        (response) => {
          loading.close();
          resolve(response);
        },
        (err) => {
          loading.close();
          reject(err);
        }
      );
  });
}

// post
export function postLoading(url, data = {}) {
  const loading = this.$loading({
    lock: true,
    text: "加载中，请稍等。。",
  });
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((response) => {
        loading.close();
        resolve(response);
      })
      .catch((err) => {
        loading.close();
        reject(err);
      });
  });
}

// post
export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// get
export function get(url, params = {}, responseType = "json") {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params,
        responseType: responseType,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// delete
export function del(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.delete(url, { data }).then(
      (response) => {
        resolve(response);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

// put
export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data).then(
      (response) => {
        resolve(response);
      },
      (err) => {
        reject(err);
      }
    );
  });
}
