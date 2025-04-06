import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('尝试连接到MongoDB...');
    console.log('连接URI:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      socketTimeoutMS: 45000, // 增加socket超时
    });

    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB连接错误: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error('无法连接到MongoDB服务器。请检查连接字符串和网络连接。');
    }
    return false;
  }
};

export default connectDB; 