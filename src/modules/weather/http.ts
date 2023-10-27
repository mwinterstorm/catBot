import axios from "axios";

// let versionType: 'v2.' | 'v2d.' | 'v2n.' | 'v3.' | undefined

export async function wttr(url:string, version?: any ) {
  let baseURL = 'https://' + version + 'wttr.in'
  if (!version) {
    baseURL = 'https://wttr.in'
  }
  const res = await axios.get(url,{
    baseURL: baseURL,
  });
  return res
}

export default {
  wttr
}



