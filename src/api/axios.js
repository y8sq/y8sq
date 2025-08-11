import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// 请求基地址
axios.defaults.baseURL = "http://127.0.0.1:12283/";
axios.defaults.timeout = 1000 * 60;
// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    NProgress.start();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 响应拦截
axios.interceptors.response.use(
  (res) => {
    if (res.data.status == 2000) {
      log(
        "green",
        "#fff",
        res.data.message || res.data.msg || "成功2000",
        res.config.baseURL + res.config.url,
        res.config.method,
        JSON.parse(res.config.data),
        res.data
      );
    } else {
      log(
        "red",
        "#000",
        res.data.message || res.data.msg || "非2000",
        axios.defaults.baseURL + res.config.url,
        res.config.method,
        JSON.parse(res.config.data),
        res.data
      );
    }

    NProgress.done();
    return res.data;
  },
  (error) => {
    try {
      log(
        "red",
        "#000",
        "请求报错 状态码：" + error.response.status + "; code: " + error.code,
        error.config.baseURL + error.config.url,
        error.config.method,
        JSON.parse(error.config.data),
        "报错msg: " + error.message
      );
    } catch (error) {
      console.log(error);
    }
    return Promise.reject(error);
  }
);
// 接口打印处理函数
function log(
  bgColor,
  fontColor = "#fff",
  isSuccess,
  url = "",
  method,
  params,
  data
) {
  console.log("");
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "↓ ===================== ↓"
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    ""
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "响应状态：",
    isSuccess || "后台接口报错"
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "请求地址：",
    url
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "请求类型：",
    method || "post"
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "请求参数：",
    params || "无参请求"
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "响应数据：",
    data
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    ""
  );
  console.log(
    "%c%s",
    `background:${bgColor}; font-size: 14px;color:${fontColor};`,
    "↑ ===================== ↑"
  );
  console.log("");
}
export default axios;
