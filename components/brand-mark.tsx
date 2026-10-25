import Image from "next/image";

/**
 * Logo RbxDaily untuk sidebar.
 *
 * Memakai file PNG di /public/brand-logo.png (128px, ditampilkan 32px agar
 * tetap tajam di layar retina). `unoptimized` dipakai karena file sudah
 * berukuran kecil dan tidak perlu diproses oleh image optimizer Next.js.
 */
export function BrandMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand-logo.png"
      alt=""
      width={size}
      height={size}
      className={className}
      unoptimized
      priority
    />
  );
}
