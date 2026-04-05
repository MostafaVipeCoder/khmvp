import{c as i,s as a}from"./index-B-BEbZqt.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["rect",{x:"9",y:"9",width:"6",height:"6",rx:"1",key:"1ssd4o"}]],y=i("circle-stop",s);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],v=i("credit-card",d);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]],h=i("dollar-sign",g),u={async createReview(t){const{data:e,error:r}=await a.from("reviews").insert(t).select().single();if(r)throw r;return e},async getSitterReviews(t){const{data:e,error:r}=await a.from("reviews").select(`
                *,
                reviewer:reviewer_id (
                    full_name,
                    avatar_url
                )
            `).eq("reviewee_id",t).order("created_at",{ascending:!1});if(r)throw r;return e},async getBookingReview(t){const{data:e,error:r}=await a.from("reviews").select("*").eq("booking_id",t).maybeSingle();if(r)throw r;return e},async getSitterAverageRating(t){const{data:e,error:r}=await a.from("reviews").select("rating").eq("reviewee_id",t);if(r)throw r;if(!e||e.length===0)return{average:0,count:0};const o=e.reduce((n,c)=>n+(c.rating||0),0)/e.length;return{average:Math.round(o*10)/10,count:e.length}}};export{v as C,h as D,y as a,u as r};
