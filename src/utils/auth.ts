export const setSign = (token: string | null) => {
  localStorage.setItem('token', token);
};

export const getSign = (): object => {
  const token: string = localStorage.getItem('token') || '';
  return {
    Authorization: token,
  };
};
