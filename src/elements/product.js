import React from 'react';
import { Image,Card,Badge  } from 'antd';
import {getPriceVND} from '../contain/getPriceVND';
import {Link} from 'react-router-dom';
import PreviewImmage from './PreviewImmage';
const { Meta } = Card;
export default function product(props){
    const {image,name,price,id,promotional} = props.item;
    const s = Math.round((price - promotional)/price*100);
    const path={
        pathname:`/product/${id}`
    }
    const hanldeShowPrice = ()=>{
        if(promotional===null){
            return(
                <span style={{ fontSize:16, color:'#333' }}>{getPriceVND(price)+" đ"}</span>
            )
        }else{
            return(
                <div style={{ display:'flex',flexDirection:'row' }}>
                    <span style={{ fontSize:16,textDecorationLine:'line-through', color:'#333',marginRight: '10px' }}>{getPriceVND(price)+" đ"}</span>
                    <span style={{ fontSize:16,color:'red' }}>{getPriceVND(promotional)+" đ"}</span>
                </div>
            )
        }   
    }
    const title2 = (
        <Link className="title-card-product" to={path}>{name}</Link>
    )
    return(
            <div className="itemProduct" style={props.width!==undefined?{width:props.width}:{borderRadius:4, padding:0}}>
                {/* className="itemProduct"
                // hoverable
                style={props.width!==undefined?{width:props.width}:{width:305,borderRadius:4, padding:0}} */}
                
                <div className='img-product' >
                    {s === 100 ? 
                    <div style={{ overflow:"hidden"}}>
                        <Image alt="example" src={image} preview={{mask:(<PreviewImmage/>)}}/>
                    </div>
                    :
                    <Badge.Ribbon text={s+"%"} color="red">
                        <div style={{ overflow:"hidden" }}>
                            <Image style={{ overflow:"hidden" }} alt="example" src={image} preview={{mask:(<PreviewImmage/>)}}/>
                        </div>
                    </Badge.Ribbon>
                    }
                </div>
               
            
                
            
                <Meta className='title-card' title={title2} description={hanldeShowPrice()} />
            </div>
       
    )
}