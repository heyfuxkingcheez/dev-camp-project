export type LoginResDto = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nickName: string;
    email: string;
  };
};
