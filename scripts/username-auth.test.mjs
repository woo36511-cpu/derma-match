import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, normalizeUsername } from "../supabase/functions/username-auth/handler.mjs";

function fixture() {
  const state = { users: new Map(), names: new Map(), links: new Map(), sessions: new Map(), deleted: [], created: [], blocked: false, failVerification: false, race: false };
  let sequence = 0;
  const session = user => {
    const access_token = `header.${user.id}.signature`, refresh_token = `refresh-${user.id}`;
    state.sessions.set(access_token, user.id);
    return { user, access_token, refresh_token };
  };
  const admin = {
    rpc: async (name, args) => {
      let data;
      const row = state.names.get(args.p_username);
      switch (name) {
        case "username_auth_limit": data = !state.blocked; break;
        case "username_account_lookup": data = row?.user_id || null; break;
        case "username_for_user": data = [...state.names].find(([,r]) => r.user_id === args.p_user_id)?.[0] || null; break;
        case "register_username":
          if (state.race) { state.race = false; state.names.set(args.p_username,{user_id:"existing-user",digest:"existing-digest"}); }
          data = !state.names.has(args.p_username) && ![...state.names.values()].some(r=>r.user_id===args.p_user_id);
          if (data) state.names.set(args.p_username,{user_id:args.p_user_id,digest:args.p_digest});
          break;
        case "consume_username_recovery":
          data = row?.digest === args.p_old_digest ? row.user_id : null;
          if (data) row.digest = args.p_new_digest;
          break;
        case "restore_username_recovery": {
          const saved = [...state.names.values()].find(r=>r.user_id===args.p_user_id);
          data = saved?.digest === args.p_expected_digest;
          if (data) saved.digest = args.p_digest;
          break;
        }
        case "replace_username_recovery":
          [...state.names.values()].find(r=>r.user_id===args.p_user_id).digest = args.p_digest;
          data = true; break;
        default: throw new Error(`Unexpected RPC ${name}`);
      }
      return { data, error: null };
    },
    auth: {
      getUser: async token => ({ data: {user: state.users.get(state.sessions.get(token))}, error: null }),
      admin: {
        createUser: async values => {
          const user = {id:`user-${++sequence}`,email:values.email};
          state.users.set(user.id,{...user,password:values.password}); state.created.push(values);
          return {data:{user},error:null};
        },
        getUserById: async id => ({data:{user:state.users.get(id)},error:null}),
        deleteUser: async id => {
          state.deleted.push(id); state.users.delete(id);
          for(const [name,row] of state.names) if(row.user_id===id) state.names.delete(name);
          return {error:null};
        },
        generateLink: async ({email}) => {
          const user = [...state.users.values()].find(u=>u.email===email);
          const token = `link-${user.id}`; state.links.set(token,user.id);
          return {data:{properties:{hashed_token:token}},error:null};
        },
      },
    },
  };
  const makeAuth = () => ({auth:{
    signInWithPassword: async ({email,password}) => {
      const user = [...state.users.values()].find(u=>u.email===email&&u.password===password);
      return user ? {data:{user,session:session(user)},error:null} : {data:null,error:{code:"invalid_credentials",status:400,message:"private diagnostics"}};
    },
    verifyOtp: async ({token_hash}) => {
      if(state.failVerification) return {error:{message:"private token diagnostics"}};
      const user = state.users.get(state.links.get(token_hash));
      return {data:{user,session:session(user)},error:null};
    },
    signOut: async () => ({error:null}),
  }});
  const handler = createHandler({url:"https://example.supabase.co",publicKey:"public-test",secretKey:"server-test",createClient:(_,key)=>key==="server-test"?admin:makeAuth()});
  const request = async (body, token, origin="https://dearsince.vercel.app") => {
    const response=await handler(new Request("https://example.supabase.co/functions/v1/username-auth",{method:"POST",headers:{origin,"content-type":"application/json",...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)}));
    return {status:response.status,body:await response.json()};
  };
  return {state,request,session,handler};
}

test("username normalization is deterministic and excludes email, invalid and reserved names",()=>{
  assert.equal(normalizeUsername("  My_Name1 "),"my_name1");
  for(const name of ["a@b.com","ab","_name","관리자","admin","a".repeat(21)]) assert.throws(()=>normalizeUsername(name));
});

test("signup/signin/profile and single-use recovery work without collecting or sending email",async()=>{
  const {state,request}=fixture();
  const signup=await request({action:"signup",username:"Tester_1",password:"fixture-password"});
  assert.equal(signup.status,200);
  assert.equal(signup.body.username,"tester_1");
  assert.match(signup.body.recoveryCode,/^(?:[0-9A-F]{4}-){7}[0-9A-F]{4}$/);
  assert.match(state.created[0].email,/@accounts\.dearsince\.invalid$/);
  assert.equal(state.created[0].email_confirm,true);
  assert.equal(state.names.get("tester_1").digest.length,64);
  assert.ok(!JSON.stringify([...state.names.values()]).includes(signup.body.recoveryCode));
  const signed=await request({action:"signin",username:"TESTER_1",password:"fixture-password"});
  assert.equal(signed.body.userId,signup.body.userId);
  assert.equal((await request({action:"profile"},signed.body.session.access_token)).body.username,"tester_1");
  assert.equal((await request({action:"signin",username:"tester_1",password:"incorrect"})).body.code,"invalid_credentials");
  const recovery=await request({action:"recover",username:"tester_1",recoveryCode:signup.body.recoveryCode});
  assert.equal(recovery.status,200);
  assert.equal(recovery.body.recovery,true);
  assert.equal(recovery.body.userId,signup.body.userId);
  assert.notEqual(recovery.body.recoveryCode,signup.body.recoveryCode);
  assert.equal((await request({action:"recover",username:"tester_1",recoveryCode:signup.body.recoveryCode})).body.code,"invalid_recovery");
  assert.equal((await request({action:"recover",username:"tester_1",recoveryCode:recovery.body.recoveryCode})).status,200);
});

test("failed recovery session creation restores the previous one-use code without exposing provider errors",async()=>{
  const {state,request}=fixture();
  const signup=await request({action:"signup",username:"tester_2",password:"fixture-password"});
  const originalDigest=state.names.get("tester_2").digest;
  state.failVerification=true;
  assert.deepEqual(await request({action:"recover",username:"tester_2",recoveryCode:signup.body.recoveryCode}),{status:503,body:{code:"auth_unavailable"}});
  assert.equal(state.names.get("tester_2").digest,originalDigest);
  state.failVerification=false;
  assert.equal((await request({action:"recover",username:"tester_2",recoveryCode:signup.body.recoveryCode})).status,200);
});

test("username registration races clean up only the just-created account",async()=>{
  const {state,request}=fixture();
  state.users.set("existing-user",{id:"existing-user",email:"existing@example.test",password:"existing-password"});
  state.race=true;
  assert.equal((await request({action:"signup",username:"raced_name",password:"fixture-password"})).body.code,"username_taken");
  assert.deepEqual(state.deleted,["user-1"]);
  assert.ok(state.users.has("existing-user"));
  assert.equal(state.names.get("raced_name").user_id,"existing-user");
});

test("legacy binding verifies the user token, preserves identity, and code replacement rechecks the password",async()=>{
  const {state,request,session}=fixture();
  const legacy={id:"legacy-user",email:"legacy@example.test",password:"legacy-password"}; state.users.set(legacy.id,legacy);
  assert.equal((await request({action:"claim",username:"legacy_name"})).status,401);
  const token=session(legacy).access_token;
  const claimed=await request({action:"claim",username:"legacy_name"},token);
  assert.equal(claimed.status,200);
  assert.equal((await request({action:"signin",username:"legacy_name",password:"legacy-password"})).body.userId,legacy.id);
  assert.equal(state.users.get(legacy.id).email,legacy.email);
  const digest=state.names.get("legacy_name").digest;
  assert.equal((await request({action:"rotate",password:"incorrect"},token)).body.code,"invalid_credentials");
  assert.equal(state.names.get("legacy_name").digest,digest);
  const rotated=await request({action:"rotate",password:"legacy-password"},token);
  assert.equal(rotated.status,200);
  assert.equal((await request({action:"recover",username:"legacy_name",recoveryCode:claimed.body.recoveryCode})).status,401);
});

test("throttling, origin, size, field and password validation fail closed before account creation",async()=>{
  const {state,request}=fixture();
  state.blocked=true;
  assert.equal((await request({action:"signup",username:"tester_3",password:"fixture-password"})).status,429);
  state.blocked=false;
  assert.equal((await request({action:"signup",username:"tester_3",password:"fixture-password"},null,"https://untrusted.example")).status,403);
  assert.equal((await request({action:"signup",username:"tester_3",password:"short"})).body.code,"weak_password");
  assert.equal((await request({action:"signup",username:"tester_3",password:"fixture-password",user_id:"victim"})).body.code,"invalid_request");
  assert.equal((await request({action:"signup",username:"tester_3",password:"x".repeat(5000)})).status,413);
  assert.equal(state.created.length,0);
});
