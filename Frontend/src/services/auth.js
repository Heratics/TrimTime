const auth = {
  getCurrentUser(){
    try{ return JSON.parse(localStorage.getItem('user')) }catch(e){return null}
  },
  setCurrentUser(u){ localStorage.setItem('user', JSON.stringify(u)) }
}
export default auth
