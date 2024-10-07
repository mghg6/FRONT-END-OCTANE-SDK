import React, { useState, useEffect } from 'react';
import './productdetail.scss';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

// Definimos los tipos para Producto
interface Producto {
    id?: number; // Si el id existe, lo agregamos como opcional
    urlImagen: string;
    fecha: string;
    area: string;
    claveProducto: string;
    nombreProducto: string;
    pesoBruto: string | number;
    pesoNeto: string | number;
    pesoTarima: string | number;
    piezas: string | number;
    uom: string;
    fechaEntrada: string;
    productPrintCard: string;
}

const subject = new Subject<string>();

// Función para obtener datos del endpoint
const fetchData = async (epc: string): Promise<Producto | null> => {
    try {
        const response = await fetch(`http://172.16.10.31/api/socket/${epc}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        console.log("Datos obtenidos:", data);
        return data as Producto; 
    } catch (error) {
        console.error("Error al realizar la petición:", error);
        return null; 
    }
};

// Cargar datos
const loadData = async (epc: string, setProductos: React.Dispatch<React.SetStateAction<Producto[]>>) => {
    const data = await fetchData(epc);
    if (data) {
        setProductos((prev) => [
            {
                urlImagen: data.urlImagen || 'https://www.jnfac.or.kr/img/noimage.jpg',
                fecha: data.fecha || 'N/A',
                area: data.area || 'N/A',
                claveProducto: data.claveProducto || 'N/A',
                nombreProducto: data.nombreProducto || 'N/A',
                pesoBruto: data.pesoBruto || 'N/A',
                pesoNeto: data.pesoNeto || 'N/A',
                pesoTarima: data.pesoTarima || 'N/A',
                piezas: data.piezas || 'N/A',
                uom: data.uom || 'N/A',
                fechaEntrada: data.fechaEntrada || 'N/A',
                productPrintCard: data.productPrintCard || 'N/A'
            },
            ...prev
        ]);
    }
};

// Función para cambiar el estado
const updateStatus = async (epc: string, status: number) => {
    try {
        const response = await fetch(`http://172.16.10.31/api/RfidLabel/Status/${epc}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            console.log("Estado actualizado correctamente");
        } else {
            const errorText = await response.text();
            console.error("Error al actualizar el estado:", response.status, errorText);
        }
    } catch (error) {
        console.error("Error al conectarse con el endpoint:", error);
    }
};

// Función para hacer registro de entradas en ExtraInfo
const extraInfo = async (epc: string, antena: string) => {
    try {
        const epcData = await fetchData(epc);

        if (epcData && epcData.id) {
            const prodEtiquetaRFIDId = epcData.id;
            console.log(prodEtiquetaRFIDId);
            
            const response = await fetch('http://172.16.10.31/api/ProdExtraInfo/EntradaAlmacen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prodEtiquetaRFIDId: prodEtiquetaRFIDId,
                    ubicacion: "AlmacenPT",
                    fechaEntrada: new Date().toISOString(),
                    antena: antena
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                console.error("Error al registrar la información:", response.statusText);
                return null;
            }
        } else {
            console.error("No se pudo obtener el ID del EPC");
            return null;
        }
    } catch (error) {
        console.error("Error al conectarse con el endpoint de registro:", error);
        return null;
    }
};

const ProductDetail: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]); // Lista de productos

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://172.16.10.31:86/message")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.start()
            .then(() => console.log("Conectado"))
            .catch((err) => console.error("Error de conexión:", err));

        connection.on("sendMessage", (message: string) => {
            console.log("Mensaje recibido:", message);
            subject.next(message);
        });

        const processMessage = (message: string) => {
            const regex = /\[(.*?)\]\s+EPC:\s+(\d+)\s+at\s+([\d-]+\s[\d:]+)/;
            const match = message.match(regex);

            if (match) {
                const antena = match[1]; 
                const epc = match[2];
                const datetime = match[3];

                console.log("Antena:", antena);
                console.log("EPC:", epc);
                console.log("DateTime Entrada:", datetime);

                loadData(epc, setProductos);
                updateStatus(epc, 2);
                extraInfo(epc, antena);
            } else {
                console.log("No se pudo extraer la antena y EPC del mensaje.");
            }
        };

        const subscription = subject.subscribe(processMessage);

        return () => {
            connection.stop();
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="outer-container">
            <div className="product-list-container">
                <div className="entry-title">
                    <h2>Entradas</h2>
                </div>
                {productos.map((producto, index) => (
                    <div className="entry-product" key={index}>
                        <p><strong>Área:</strong> <span>{producto.area}</span></p>
                        <p><strong>Clave de Producto:</strong> <span>{producto.claveProducto}</span></p>
                        <p><strong>Producto:</strong> <span>{producto.nombreProducto}</span></p>
                        <p><strong>Peso Neto:</strong> <span>{producto.pesoNeto}</span></p>
                        <p><strong>Piezas:</strong> <span>{producto.piezas}</span></p>
                        <p><strong>Unidad de Medida:</strong> <span>{producto.uom}</span></p>
                    </div>
                ))}
            </div>
            <div className="container">
                {productos.length > 0 && (
                    <div className="product-image">
                        <img src={productos[0].urlImagen} alt="Imagen del Producto" />
                    </div>
                )}
                <div className="product-details">
                    <h1>Detalles del Producto</h1>
                    {productos.length > 0 && (
                        <>
                            <div className="detail-row">
                                <p><strong>Área:</strong> <span>{productos[0].area}</span></p>
                                <p><strong>Fecha:</strong> <span>{productos[0].fecha}</span></p>
                            </div>
                            <div className="">
                                <p><strong>Clave de Producto:</strong> <span>{productos[0].claveProducto}</span></p>
                                <p><strong>Producto:</strong> <span>{productos[0].nombreProducto}</span></p>
                            </div>
                            <div className="detail-row">
                                <p><strong>Peso Bruto:</strong> <span>{productos[0].pesoBruto}</span></p>
                                <p><strong>Peso Neto:</strong> <span>{productos[0].pesoNeto}</span></p>
                            </div>
                            <div className="detail-row">
                                <p><strong>Piezas:</strong> <span>{productos[0].piezas}</span></p>
                                <p><strong>Peso Tarima:</strong> <span>{productos[0].pesoTarima}</span></p>
                            </div>
                            <div className="">
                                <p><strong>Fecha de Entrada:</strong> <span>{productos[0].fechaEntrada}</span></p>
                                <p><strong>Unidad de Medida:</strong> <span>{productos[0].uom}</span></p>
                            </div>
                            <p><strong>PrintCard:</strong> <span>{productos[0].productPrintCard}</span></p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;