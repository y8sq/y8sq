import { post } from "./http";
const baseURL = "upload/";

// 上传图片
export const postUsersUploadImage = (params) => {
  return post(`${baseURL}users/image`, params);
};
