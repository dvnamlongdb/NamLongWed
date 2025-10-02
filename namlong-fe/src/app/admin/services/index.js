/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */

import RestAPI from "../../../service";
import Cookies from "js-cookie";

export async function createToken(token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  Cookies.set("token", token, {
    expires: expiresAt,
    path: "/",
  });
}

export async function login(req) {
  try {
    const res = await RestAPI.post("/login", req);
    
    createToken(res?.data?.token)
  } catch (e) {
    return e;
  }
}
