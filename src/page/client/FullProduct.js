import React ,{useEffect,useState} from 'react';
import * as FetchAPI from '../../util/fetchApi';
import {Pagination,Col,Row,Breadcrumb} from 'antd';
import Product from '../../elements/product';
import { useParams,useHistory,useLocation,Link } from 'react-router-dom';
import Spinner from '../../elements/spinner';
export default function FullProduct(){
    const [showContent, setshowContent] = useState(false);
    const [dataProduct, setdataProduct] = useState([]);
    const [totalProduct, settotalProduct] = useState();
    const PageSize = 8;
    const {page} = useParams();
    const history = useHistory();
    const location = useLocation();
    useEffect(()=>{
        window.scroll(0,0)
        getFullProduct();
    },[location])
    const getFullProduct = async()=>{
        setshowContent(false)
        let arrTmp = []
        const res = await FetchAPI.getAPI("/product/getFullProduct");
        res.map((item,index)=>{
            if(index<PageSize*page&&index>=PageSize*(page-1)){
                arrTmp.push(item)
            }
        })
        setdataProduct(arrTmp)
        settotalProduct(res.length)
        setshowContent(true)
    }
    const ItemProduct = dataProduct.map((item)=>{
        return(
            <div style={{ padding:'0 15px', marginBottom:12 }} >
            <Product
                item={item}
            />
        </div>
        )
    })
    return(
        <div style={{ maxWidth:1340, margin:'auto' }}>
            {showContent ?
            <div className='wrapper-full-product' style={{ display:'flex',flexDirection:'column',justifyContent:'center', padding:'60px 0' }}>
                 <span className="title-list"  style={{ fontSize:30,paddingBottom:20,fontWeight:'bold', width:'auto', margin:'auto' }}>
                 CỬA HÀNG
                </span>
                <Breadcrumb style={{ fontSize:18,padding:"20px 20px"}}>
                    <Breadcrumb.Item>
                        <Link to={"/home"}>Trang chủ</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {`Cửa hàng`}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Row gutter={ [{ xs: 8, sm: 16, md: 24, lg: 24 },20]} style={{ width:'100%' }} >
                        {ItemProduct}
                </Row>
                <div style={{ justifyContent:'center',display:'flex',paddingTop:20 }}>
                <Pagination 
                    defaultPageSize={PageSize} 
                    defaultCurrent={page} 
                    total={totalProduct} 
                    onChange= {(e)=>history.push(`/fullproduct/${e}`)}
                />
                </div>
            </div>
            :
            <Spinner spinning={!showContent}/>
            }
        </div>
    )
}