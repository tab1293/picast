from types import *

class VlcModule(object):

    def __init__(self, name):
        self._options = []
        self._valid_modules = ['standard', 'transcode', 'duplicate', 'display', 'rtp', 'es']
        if name not in self._valid_modules:
            raise ValueError('Not a valid module name')

        self._name = name

    def __str__(self):
        print(self._options)
        output = self._name + "{"
        for i, option in enumerate(self._options):
            if option[1]:
                output += "{0}={1}".format(option[0], option[1])
                if option[2]:
                    output += '{'
                    j = 0
                    for k, parameter_option in option[2].items():
                        if type(parameter_option) == bool:
                            output += k
                        else:
                            output += "{0}={1}".format(k, parameter_option)

                        if j == len(option[2]) - 1:
                            output += '}'
                        else:
                            output += ','

                        j = j + 1
            else:
                output += option[0]

            if i == len(self._options) - 1:
                output += '}'
            else:
                output += ','

        return output

    def getName(self):
        return self._name

    def setOption(self, opt_name, param=None, valid_params=None, param_opts=[], valid_param_opts=[]):
        if valid_params:
            if param in valid_params:
                self.validateParamOpts(param, param_opts, valid_param_opts)
                self._options.append([opt_name, param, param_opts])
            else:
                raise NameError("{0} is not a valid param for option {1}".format(param, opt_name))
        # Assume the child class has validified the parameter
        else:
            self._options.append([opt_name, param, param_opts])

    def getOption(self, opt_name):
        for option in self._options:
            if opt_name == option[0]:
                return [option[1], option[2]]

        return None


    # TODO: Needs to be checked
    def validateParamOpts(self, param, param_opts, valid_param_opts):
        if not param_opts:
            return True

        if param in valid_param_opts:
            valid_param_opts = valid_param_opts[param]
            print(valid_param_opts)
            for k, param_opt in param_opts.items():
                print(k)
                print(valid_param_opts)
                if k in valid_param_opts:
                    if type(param_opt) == valid_param_opts[k]:
                        continue
                    else:
                        raise ValueError("The parameter option is not of the correct type")
                else:
                    raise ValueError("This is not a valid parameter option to be set")
        else:
            raise ValueError("This paramter has no options to be set")

        return True
