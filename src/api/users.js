import { post } from "./http";
const baseURL = "users/";
// 登录
export const postUsersLogin = (params) => {
  return post(`${baseURL}login`, params);
};
// 注册
export const postUsersRegister = (params) => {
  return post(`${baseURL}register`, params);
};
// 根据id获取用户数据
export const postUsersGetById = (params) => {
  return post(`${baseURL}get/by/id`, params);
};
// 分页查询用户数据
export const postUsersGetPageList = (params) => {
  return post(`${baseURL}get/page/list`, params);
};
// 删除用户数据
export const postUsersDelete = (params) => {
  return post(`${baseURL}delete`, params);
};
// 修改用户数据
export const postUsersUpdate = (params) => {
  return post(`${baseURL}update`, params);
};
