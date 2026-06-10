
// funcao é chamada qnd qualuqer controler roda next()
export async function globalErrorHandler(err, req, res, next) {

  console.log("need to implement custom error classes to easily handle different types of errors with different http codes, messages, resposes etc");
  console.log("Error: ", err)
  //troque os campos se vc quiser, mas FAÇA ERROS CUSTOMIZADOS, essa função deve ser usada como abaixo
  return res.status(500).json({status: "500", message: "Internal server error", code: "API_SERVER_ERROR"});
}


// export async function globalErrorHandler(err, req, res, next) {
//   if (err instanceof AppError) { -- classe customizada de erro com codigo http proprio, mensagem propria etc
//     return res.status(err.HTTPCode).json({ err.message, err.errorCode, err.field });
//   }

//   //troque os campos se vc quiser, mas FAÇA ERROS CUSTOMIZADOS, essa função deve ser usada como abaixo
//   return res.status(500).json({ status: "500", message: "Internal server error", code: "API_SERVER_ERROR" });
// }
