import{da as a,dB as R,d8 as T,d5 as _,d7 as e,em as E,en as W,dV as F,dt as u,e4 as U}from"./index-DaMgC3kK.js";import{F as V}from"./ShieldCheckIcon-BsBGfYiH.js";import{m as N}from"./ModalHeader-DfHxv9fE-DqWabYCR.js";import{l as O}from"./Layouts-BlFm53ED-ChchHDR0.js";import{g as H,h as z,u as B,b as M,k as D}from"./shared-Bw0pXSOO-CyVyAi51.js";import{w as s}from"./Screen-CDEd4p2a-CtmM0Ds1.js";import"./index-Dq_xe9dz-BzZ6CEU4.js";const re={component:()=>{let[o,h]=a.useState(!0),{authenticated:p,user:g}=R(),{walletProxy:y,closePrivyModal:m,createAnalyticsEvent:v,client:b}=T(),{navigate:j,data:k,onUserCloseViaDialogOrKeybindRef:A}=_(),[n,C]=a.useState(void 0),[x,l]=a.useState(""),[d,f]=a.useState(!1),{entropyId:c,entropyIdVerifier:$,onCompleteNavigateTo:w,onSuccess:S,onFailure:I}=k.recoverWallet,i=(r="User exited before their wallet could be recovered")=>{m({shouldCallAuthOnSuccess:!1}),I(typeof r=="string"?new F(r):r)};return A.current=i,a.useEffect((()=>{if(!p)return i("User must be authenticated and have a Privy wallet before it can be recovered")}),[p]),e.jsxs(s,{children:[e.jsx(s.Header,{icon:V,title:"Enter your password",subtitle:"Please provision your account on this new device. To continue, enter your recovery password.",showClose:!0,onClose:i}),e.jsx(s.Body,{children:e.jsx(K,{children:e.jsxs("div",{children:[e.jsxs(H,{children:[e.jsx(z,{type:o?"password":"text",onChange:r=>(t=>{t&&C(t)})(r.target.value),disabled:d,style:{paddingRight:"2.3rem"}}),e.jsx(B,{style:{right:"0.75rem"},children:o?e.jsx(M,{onClick:()=>h(!1)}):e.jsx(D,{onClick:()=>h(!0)})})]}),!!x&&e.jsx(L,{children:x})]})})}),e.jsxs(s.Footer,{children:[e.jsx(s.HelpText,{children:e.jsxs(O,{children:[e.jsx("h4",{children:"Why is this necessary?"}),e.jsx("p",{children:"You previously set a password for this wallet. This helps ensure only you can access it"})]})}),e.jsx(s.Actions,{children:e.jsx(Y,{loading:d||!y,disabled:!n,onClick:async()=>{f(!0);let r=await b.getAccessToken(),t=E(g,c);if(!r||!t||n===null)return i("User must be authenticated and have a Privy wallet before it can be recovered");try{v({eventName:"embedded_wallet_recovery_started",payload:{walletAddress:t.address}}),await y?.recover({accessToken:r,entropyId:c,entropyIdVerifier:$,recoveryPassword:n}),l(""),w?j(w):m({shouldCallAuthOnSuccess:!1}),S?.(t),v({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:t.address}})}catch(P){W(P)?l("Invalid recovery password, please try again."):l("An error has occurred, please try again.")}finally{f(!1)}},$hideAnimations:!c&&d,children:"Recover your account"})}),e.jsx(s.Watermark,{})]})]})}};let K=u.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,L=u.div`
  line-height: 20px;
  height: 20px;
  font-size: 13px;
  color: var(--privy-color-error);
  text-align: left;
  margin-top: 0.5rem;
`,Y=u(N)`
  ${({$hideAnimations:o})=>o&&U`
      && {
        // Remove animations because the recoverWallet task on the iframe partially
        // blocks the renderer, so the animation stutters and doesn't look good
        transition: none;
      }
    `}
`;export{re as PasswordRecoveryScreen,re as default};
