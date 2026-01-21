import Link from 'next/link';
import Image from 'next/image'; // Image компонентийг импорт хийнэ

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Image
        src="/assets/images/404-computer.svg" // Зургийн зам
        alt="404 Not Found"
        width={500} // Зургийн өргөн
        height={500} // Зургийн өндөр
        className="mb-8"
      />
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-8">Уучлаарай, энэ хуудас Хараахан бэлэн болоогүй.</h2>
      <p className="text-lg text-center mb-8">
        Таны хайж буй хуудас устаж, нэр нь өөрчлөгдсөн эсвэл түр зуур байхгүй байна.
      </p>
      <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Нүүр хуудас руу буцах
      </Link>
    </div>
  );
}
