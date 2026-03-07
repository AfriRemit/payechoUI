import{d5 as F,d6 as T,d8 as I,da as c,dx as y,d7 as t,dz as h,du as O,dt as o}from"./index-DaMgC3kK.js";import{h as q}from"./CopyToClipboard-DSTf_eKU-CnymvGRH.js";import{n as B}from"./OpenLink-DZHy38vr-CVE4xDVL.js";import{C as E}from"./QrCode-D4XZQrgi-BQSMW6fC.js";import{n as M}from"./ScreenLayout-BdRrZJd_-BpKAGygw.js";import{l as x}from"./farcaster-DPlSjvF5-DnkJvyk2.js";import"./browser-CIOg5deW.js";import"./ModalHeader-DfHxv9fE-DqWabYCR.js";import"./Screen-CDEd4p2a-CtmM0Ds1.js";import"./index-Dq_xe9dz-BzZ6CEU4.js";let S="#8a63d2";const _=({appName:d,loading:m,success:u,errorMessage:e,connectUri:a,onBack:r,onClose:l,onOpenFarcaster:s})=>t.jsx(M,h.isMobile||m?h.isIOS?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${d} to add casts, likes, follows, and more on your behalf.`,icon:x,iconVariant:"loading",iconLoadingStatus:{success:u,fail:!!e},primaryCta:a&&s?{label:"Open Farcaster app",onClick:s}:void 0,onBack:r,onClose:l,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:x,iconVariant:"loading",iconLoadingStatus:{success:u,fail:!!e},onBack:r,onClose:l,watermark:!0,children:a&&h.isMobile&&t.jsx(A,{children:t.jsx(B,{text:"Take me to Farcaster",url:a,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${d} to add casts, likes, follows, and more on your behalf.`,onBack:r,onClose:l,watermark:!0,children:t.jsxs(R,{children:[t.jsx(z,{children:a?t.jsx(E,{url:a,size:275,squareLogoElement:x}):t.jsx(P,{children:t.jsx(O,{})})}),t.jsxs(L,{children:[t.jsx(N,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),a&&t.jsx(q,{text:a,itemName:"link",color:S})]})]})});let A=o.div`
  margin-top: 24px;
`,R=o.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,z=o.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,L=o.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,N=o.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,P=o.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const Y={component:()=>{let{lastScreen:d,navigateBack:m,data:u}=F(),e=T(),{requestFarcasterSignerStatus:a,closePrivyModal:r}=I(),[l,s]=c.useState(void 0),[k,v]=c.useState(!1),[j,w]=c.useState(!1),g=c.useRef([]),n=u?.farcasterSigner;c.useEffect((()=>{let b=Date.now(),i=setInterval((async()=>{if(!n?.public_key)return clearInterval(i),void s({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});n.status==="approved"&&(clearInterval(i),v(!1),w(!0),g.current.push(setTimeout((()=>r({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y)));let p=await a(n?.public_key),C=Date.now()-b;p.status==="approved"?(clearInterval(i),v(!1),w(!0),g.current.push(setTimeout((()=>r({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y))):C>3e5?(clearInterval(i),s({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):p.status==="revoked"&&(clearInterval(i),s({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))}),2e3);return()=>{clearInterval(i),g.current.forEach((p=>clearTimeout(p)))}}),[]);let f=n?.status==="pending_approval"?n.signer_approval_url:void 0;return t.jsx(_,{appName:e.name,loading:k,success:j,errorMessage:l,connectUri:f,onBack:d?m:void 0,onClose:r,onOpenFarcaster:()=>{f&&(window.location.href=f)}})}};export{Y as FarcasterSignerStatusScreen,_ as FarcasterSignerStatusView,Y as default};
