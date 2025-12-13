'use client';

import Link from 'next/link';

export default function Action({ name, id, icon:Icon, onClick,...props }) {
  let path = name;
  console.log(path)
    if(name==='Home' || name ==='close'){
      path = name ==='Home'?'/':'';
    }
    else if(name==='login'){
      path='/auth';
    }


  return (
    <li>
      <Link
        href={`./${path}`}
        className="flex items-center gap-2 py-2 px-2 lg:px-4 text-white max-[850px]:text-black hover:text-red-600 transition-colors duration-200"
        onClick={onClick}
        title={name}
        {...props}
      >
        {/* <Image src={imgSrc} alt={`${name} icon`} width="20" height={20} /> */}
       <Icon/>
        {name != "close" && <span className="text-base font-medium"  >{name}</span>}
      </Link>
    </li>
  );
}
