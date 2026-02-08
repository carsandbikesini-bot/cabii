(async ()=>{
  try{
    const fetch = global.fetch || (await import('node-fetch')).default;
    const base = 'http://localhost:5000';

    // 1) Signup
    let res = await fetch(base + '/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:'E2E User', email:'e2e.user@example.com', password:'Password123' }) });
    let data = await res.json().catch(()=>({}));
    console.log('signup status', res.status, data);
    const userId = data.user?._id || data.user?.id;

    // 2) Post ad using header token
    // Use built-in FormData (Node 18+) and a small text file if available
    const fd = new FormData();
    fd.append('brand','E2EBrand');
    fd.append('model','E2EModel');
    fd.append('price','12345');
    fd.append('location','E2ECity');
    fd.append('description','E2E test ad');
    // attach a small file if it exists
    const fs = await import('fs');
    const logoPath = '../Frontend/images/logo.png';
    if(fs.existsSync(logoPath)){
      const buf = await fs.promises.readFile(logoPath);
      const file = new Blob([buf]);
      // Node's FormData accepts Blob
      fd.append('images', file, 'logo.png');
    }

    res = await fetch(base + '/ads', { method:'POST', headers:{ 'X-User-Id': userId }, body: fd });
    data = await res.json().catch(()=>({}));
    console.log('post ad status', res.status, data);

    // 3) Fetch ads
    res = await fetch(base + '/ads');
    data = await res.json().catch(()=>([]));
    console.log('ads count', (Array.isArray(data)? data.length : 0));

  }catch(err){ console.error('E2E error', err); process.exit(1); }
})();