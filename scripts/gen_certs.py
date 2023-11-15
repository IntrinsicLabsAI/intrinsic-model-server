import os
import socket


def gen_self_signed_cert(cert_name, cakey=None, casubj=None):
    """
    Returns (cert, key) as ASCII PEM strings
    """
    import datetime
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    from cryptography.x509.oid import NameOID

    one_day = datetime.timedelta(1, 0, 0)
    private_key = rsa.generate_private_key(
        public_exponent=65537, key_size=2048, backend=default_backend()
    )
    public_key = private_key.public_key()

    builder = (
        x509.CertificateBuilder()
        .subject_name(x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cert_name)]))
        .issuer_name(
            x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, casubj or cert_name)])
        )
        .not_valid_before(datetime.datetime.today() - one_day)
        .not_valid_after(datetime.datetime.today() + (one_day * 365 * 5))
        .serial_number(x509.random_serial_number())
        .public_key(public_key)
        .add_extension(
            x509.SubjectAlternativeName(
                [
                    x509.DNSName(socket.gethostname()),
                    x509.DNSName("*.dev.intrinsiclabs.ai"),
                    x509.DNSName("localhost"),
                    x509.DNSName("*.localhost"),
                ]
            ),
            critical=False,
        )
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
    )

    if cakey is not None:
        certificate = builder.sign(
            private_key=cakey, algorithm=hashes.SHA256(), backend=default_backend()
        )
    else:
        certificate = builder.sign(
            private_key=private_key,
            algorithm=hashes.SHA256(),
            backend=default_backend(),
        )

    return (
        certificate,
        private_key,
        certificate.public_bytes(serialization.Encoding.PEM),
        private_key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        ),
    )


def entrypoint() -> None:
    CACERTFILE = "cacert.pem"
    CAKEYFILE = "cakey.pem"

    if os.path.exists(CACERTFILE):
        raise ValueError("Cannot overwrite existing cacertfile @ {}".format(CACERTFILE))
    if os.path.exists(CAKEYFILE):
        raise ValueError("Cannot overwrite existing cakeyfile @ {}".format(CAKEYFILE))

    CERTFILE = "cert.pem"
    KEYFILE = "key.pem"

    if os.path.exists(CERTFILE):
        raise ValueError("Cannot overwrite existing certfile @ {}".format(CERTFILE))
    if os.path.exists(KEYFILE):
        raise ValueError("Cannot overwrite existing keyfile @ {}".format(KEYFILE))

    _, caprivkey, cacertpem, caprivkeypem = gen_self_signed_cert("dev-root-ca")
    _, _, certpem, privkeypem = gen_self_signed_cert(
        "worker", cakey=caprivkey, casubj="dev-root-ca"
    )

    print("=== Writing cacert.pem with contents ===")
    print(str(cacertpem, "utf-8"))
    print("=== Wrote cacert.pem with contents ===")
    with open(CACERTFILE, "wb") as f:
        f.write(cacertpem)

    print("=== Writing cakey.pem with contents ===")
    print(str(caprivkeypem, "utf-8"))
    print("=== Wrote cakey.pem with contents ===")
    with open(CAKEYFILE, "wb") as f:
        f.write(caprivkeypem)

    print("=== Writing cert.pem with contents ===")
    print(str(certpem, "utf-8"))
    print("=== Wrote cert.pem with contents ===")
    with open(CERTFILE, "wb") as f:
        f.write(certpem)

    print("=== Writing keyfile.pem with contents ===")
    print(str(privkeypem, "utf-8"))
    print("=== Wrote keyfile.pem with contents ===")
    with open(KEYFILE, "wb") as f:
        f.write(privkeypem)
