from enum import Enum


class FormaPagamento(str, Enum):
    DINHEIRO = "dinheiro"
    CARTAO = "cartao"
    PIX = "pix"


class StatusPedido(str, Enum):
    RECEBIDO = "recebido"
    CONFIRMADO = "confirmado"
    EM_PREPARO = "em_preparo"
    SAIU_PARA_ENTREGA = "saiu_para_entrega"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"


class RemetenteTipo(str, Enum):
    CLIENTE = "cliente"
    ADMIN = "admin"
