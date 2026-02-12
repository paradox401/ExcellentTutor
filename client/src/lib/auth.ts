export const getToken = () => localStorage.getItem("token");

export const isAuthed = () => Boolean(getToken());

export const getRole = () => localStorage.getItem("role");

export const setRole = (role?: string) => {
  if (!role) {
    localStorage.removeItem("role");
    return;
  }
  localStorage.setItem("role", role);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
