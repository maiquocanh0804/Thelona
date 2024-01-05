import React,{useEffect,useState} from 'react';
import {Row,Col,Breadcrumb} from 'antd';
import { useParams,Link } from 'react-router-dom';
import * as FetchAPI from '../../util/fetchApi';
import Product from '../../elements/product';
import Spinner from '../../elements/spinner';
export default function SearchView (){
    const [dataProduct, setdataProduct] = useState([]);
    const {datasearch} = useParams();
    const [showContent, setshowContent] = useState(false);
    useEffect(()=>{
        setshowContent(false)
        getProduct();
    },[datasearch])
    const getProduct = async()=>{
        const res = await FetchAPI.postDataAPI("/product/searchProduct",{"datasearch":datasearch});
        setdataProduct(res)
        setshowContent(true)
    }
    const ItemProduct = dataProduct.map((item)=>{
        return(
            <Col style={{display:'flex', justifyContent:'center' }} xl={6} md={8} xs={12}>
                <Product
                    item={item}
                />
            </Col>
        )
    })
    const Direction = ()=>(
        <Breadcrumb style={{ fontSize:18, paddingBottom:20}}>
            <Breadcrumb.Item>
                <Link to={"/home"}>Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <Link to={"/fullproduct/1"}>Cửa hàng</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                {`Kết quả tìm kiếm của "${datasearch}"`}
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    return(
        <div style={{ minHeight:500 }}>
            {showContent ? 
            <div style={{ maxWidth:'1340px', margin:'auto' }}>
                <div style={{display:'flex',flexDirection:'column',justifyContent:'center', paddingTop:'60px' }}>
                <span style={{ fontSize:30,paddingBottom:20,fontWeight:'bold', width:'auto', margin:'auto'}}>{`Kết quả tìm kiếm của "${datasearch}"`}</span>
                {Direction()}
                </div>
                {dataProduct.length!==0 ?
                <Row gutter={ [{ xs: 8, sm: 16, md: 24, lg: 24 },20]} style={{ width:'100%',paddingTop:20 }} >
                        {ItemProduct}
                </Row>
                :
                <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:400 }}>
                    Không sản phẩm nào được tìm thấy...
                </div>
                }
            </div>
            :
            <Spinner spinning={!showContent}/>
            }
        </div>
    )
}