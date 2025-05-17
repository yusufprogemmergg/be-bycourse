import app from '../src/app';

export default app;

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
})